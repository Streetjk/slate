# Optional inspection CA for Slate

The ESP-IDF certificate bundle can include an additional, locally supplied PEM root certificate without removing its normal public CAs.

1. Obtain the root certificate from the organisation managing the network, verify its SHA-256 fingerprint with a known-good source, and save its PEM encoding as `certs/local-inspection-ca.pem`.
2. Keep the PEM local; `firmware/certs/*.pem` is ignored by Git. Do not add a private key.
3. With ESP-IDF v5.5.2 exported, build from `firmware/` using:

   ```sh
   SDKCONFIG_DEFAULTS="sdkconfig.defaults;sdkconfig.local-inspection.defaults" idf.py -B build-hcmo build
   ```

4. Confirm the generated `sdkconfig` enables `CONFIG_MBEDTLS_CUSTOM_CERTIFICATE_BUNDLE`, the custom path, and the full default bundle; then test a verified HTTPS connection on the intended network.

Never set `skip_cert_common_name_check`, disable certificate validation, or flash a device with an unreconciled running-image identity. An explicit local CA trusts the network inspection operator for HTTPS connections made by this firmware.
