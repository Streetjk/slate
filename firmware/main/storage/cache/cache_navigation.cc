#include "storage/cache/cache.h"

#include <cJSON.h>
#include <esp_log.h>
#include <sys/stat.h>

#include <unistd.h>

#include <cstring>

#include "storage/cache/cache_io.h"
#include "storage/cache/cache_paths.h"

namespace {

constexpr char kTag[] = "cache_nav";
constexpr long kMaxNavigationMetaBytes = 16 * 1024;
constexpr int kMaxNavigationVariants = 64;

bool IsSafeKey(const std::string& key) {
    if (key.empty() || key.size() > 48)
        return false;
    for (unsigned char ch : key) {
        if (!((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch == '-' ||
              ch == '_'))
            return false;
    }
    return true;
}

}  // namespace

namespace cache {

bool NavigationImageExists(const std::string& gid, int idx, const std::string& key) {
    if (!IsSafeKey(key))
        return false;
    struct stat st;
    return stat(internal::NavigationImagePath(gid, idx, key).c_str(), &st) == 0 && S_ISREG(st.st_mode) &&
           st.st_size == internal::kFrameImageBytes;
}

bool WriteNavigationImage(const std::string& gid, int idx, const std::string& key,
                          const std::vector<uint8_t>& bytes) {
    if (!IsSafeKey(key) || bytes.size() != static_cast<size_t>(internal::kFrameImageBytes))
        return false;
    internal::DirEnsure(internal::GroupDir(gid));
    internal::DirEnsure(internal::FramesDir(gid));
    if (!internal::DirEnsure(internal::NavigationDir(gid, idx)))
        return false;
    return internal::WriteAll(internal::NavigationImagePath(gid, idx, key), bytes.data(), bytes.size());
}

bool ReadNavigationImage(const std::string& gid, int idx, const std::string& key, std::vector<uint8_t>& out) {
    if (!IsSafeKey(key))
        return false;
    return internal::ReadAll(internal::NavigationImagePath(gid, idx, key), out, internal::kFrameImageBytes);
}

bool WriteNavigationBundleMeta(const std::string& gid, int idx, const NavigationBundleMeta& meta) {
    if (meta.revision.empty() || meta.selected_key.empty() || meta.variants.size() < 2 ||
        meta.variants.size() > kMaxNavigationVariants)
        return false;

    cJSON* root = cJSON_CreateObject();
    cJSON* variants = cJSON_CreateArray();
    if (!root || !variants) {
        cJSON_Delete(root);
        cJSON_Delete(variants);
        return false;
    }

    cJSON_AddStringToObject(root, "revision", meta.revision.c_str());
    cJSON_AddStringToObject(root, "selected_key", meta.selected_key.c_str());
    cJSON_AddBoolToObject(root, "wrap", meta.wrap);

    bool selected_found = false;
    for (const auto& variant : meta.variants) {
        if (!IsSafeKey(variant.key) || variant.image_etag.empty()) {
            cJSON_Delete(variants);
            cJSON_Delete(root);
            return false;
        }
        if (!NavigationImageExists(gid, idx, variant.key)) {
            cJSON_Delete(variants);
            cJSON_Delete(root);
            return false;
        }
        selected_found |= variant.key == meta.selected_key;
        cJSON* item = cJSON_CreateObject();
        if (!item) {
            cJSON_Delete(variants);
            cJSON_Delete(root);
            return false;
        }
        cJSON_AddStringToObject(item, "key", variant.key.c_str());
        cJSON_AddStringToObject(item, "label", variant.label.c_str());
        cJSON_AddStringToObject(item, "image_etag", variant.image_etag.c_str());
        cJSON_AddStringToObject(item, "status_bar_text", variant.status_bar_text.c_str());
        cJSON_AddItemToArray(variants, item);
    }
    if (!selected_found) {
        cJSON_Delete(variants);
        cJSON_Delete(root);
        return false;
    }
    cJSON_AddItemToObject(root, "variants", variants);

    char* text = cJSON_PrintUnformatted(root);
    cJSON_Delete(root);
    if (!text)
        return false;

    const size_t len = std::strlen(text);
    const bool ok = len <= static_cast<size_t>(kMaxNavigationMetaBytes) &&
                    internal::WriteAll(internal::NavigationMetaPath(gid, idx), text, len);
    cJSON_free(text);
    return ok;
}

bool ReadNavigationBundleMeta(const std::string& gid, int idx, NavigationBundleMeta& out) {
    out = {};
    std::vector<uint8_t> bytes;
    if (!internal::ReadAll(internal::NavigationMetaPath(gid, idx), bytes, kMaxNavigationMetaBytes) || bytes.empty())
        return false;

    cJSON* root = cJSON_ParseWithLength(reinterpret_cast<const char*>(bytes.data()), bytes.size());
    if (!root)
        return false;

    auto read_string = [](cJSON* parent, const char* key) -> std::string {
        cJSON* value = cJSON_GetObjectItemCaseSensitive(parent, key);
        return cJSON_IsString(value) && value->valuestring ? value->valuestring : "";
    };

    out.revision = read_string(root, "revision");
    out.selected_key = read_string(root, "selected_key");
    cJSON* wrap = cJSON_GetObjectItemCaseSensitive(root, "wrap");
    out.wrap = cJSON_IsTrue(wrap);

    cJSON* variants = cJSON_GetObjectItemCaseSensitive(root, "variants");
    if (!cJSON_IsArray(variants)) {
        cJSON_Delete(root);
        return false;
    }
    cJSON* item = nullptr;
    cJSON_ArrayForEach(item, variants) {
        if (static_cast<int>(out.variants.size()) >= kMaxNavigationVariants)
            break;
        if (!cJSON_IsObject(item))
            continue;
        NavigationVariantMeta variant;
        variant.key = read_string(item, "key");
        variant.label = read_string(item, "label");
        variant.image_etag = read_string(item, "image_etag");
        variant.status_bar_text = read_string(item, "status_bar_text");
        if (!IsSafeKey(variant.key) || variant.image_etag.empty() || !NavigationImageExists(gid, idx, variant.key))
            continue;
        out.variants.push_back(std::move(variant));
    }
    cJSON_Delete(root);

    if (out.revision.empty() || out.selected_key.empty() || out.variants.size() < 2)
        return false;
    for (const auto& variant : out.variants) {
        if (variant.key == out.selected_key)
            return true;
    }
    return false;
}

void DeleteNavigationBundle(const std::string& gid, int idx) {
    internal::RemoveTree(internal::NavigationDir(gid, idx));
    unlink(internal::NavigationMetaPath(gid, idx).c_str());
}

}  // namespace cache
