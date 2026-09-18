# A8 canonical source

`tk2/A8/` is the checked-in canonical A8 application source for IB2026 and the runtime source of truth for A8.

Package 1 reconstructed the verified DEV runtime from `modebrecht/shortcut-quest@6a655e2ba732dca9c84b08a74341d6adcda9b63b`, integrated the IB2026 PDF/report and runtime overlays, and integrated the narrative-fly lifecycle cleanup directly into `index.html`.

The former Vercel pin `6588df3ee87797f916fe7cd6b8a149d7b48e6dee` was compared separately. Its production-runtime battle fix (consumed enemy heal-item events) is preserved in the local `battle-balance.js`; its other delta was QA hardening rather than runtime source.

Package 2 switched both GitHub Pages DEV and Vercel to consume this checked-in directory directly. Deployment is now copy + validate: neither build path downloads, patches, injects, or reassembles A8 from an external repository.

The legacy narrative patch script and its regression test remain in the repository for Package 3 cleanup, but normal A8 deployment no longer calls them.
