# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.5.5](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.5.4...v0.5.5) (2025-08-26)


### Features

* **renderFn:** allow render access to ctx obj ([40b9e03](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/40b9e03b42fd970b13fd3168a80b025018d953dd))

## [0.5.4](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.5.3...v0.5.4) (2025-08-25)


### Features

* **renderFn:** now returns map of target elements ([a835c75](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/a835c75859f2e299fb1f762a3afa8207d08d9c2c))

## [0.5.3](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.5.2...v0.5.3) (2025-08-22)


### Bug Fixes

* **deps:** release dependency updates ([#60](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/issues/60)) ([9e9e449](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/9e9e4493c800ecc048ddfd4f393ea6b01ae5cfbf))

## [0.5.2](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.5.1...v0.5.2) (2025-08-22)


### Features

* **ctx_rendering:** enable renderer to be aware of page data ([95e9fff](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/95e9fff2d0226a277a5603460d4caf643fd6ea3d))

## [0.5.1](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.5.0...v0.5.1) (2025-08-12)


### Bug Fixes

* **deps:** release dependency updates ([de6221f](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/de6221f3f62b05a4bd8c744fac1aa0edf31a3303))

## [0.5.0](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.4.7...v0.5.0) (2025-02-25)


### ⚠ BREAKING CHANGES

* **custom-rendering:** invert control on defining renderer, making it accessible to user too

### Features

* **custom-rendering:** invert control on defining renderer, making it accessible to user too ([dc6629a](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/dc6629abd1535a684988da80a632ae7ca7a43296))

## [0.4.7](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.4.6...v0.4.7) (2025-02-25)


### Features

* **renderer:** allow customizing marked render behaviour via extensions in options ([ca27483](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/ca27483b8066b62b86d5ad54fe4997c867b545f2))


### Bug Fixes

* **deps:** bump jsdom in the prod-dependencies-major group ([a0335d2](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/a0335d28df54651fd14c712391e479bdb976ef6c))

## [0.4.6](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.4.5...v0.4.6) (2025-02-22)


### Features

* **debug:** add debug logging method w/ call site location tag ([#41](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/issues/41)) ([e317ad3](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/e317ad3509856aea001bbac14cf44bdecbffb3a4))


### Bug Fixes

* **ctx:** remove data that shouldn't be exposed from injected ctx obj ([84c8588](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/84c85889da20220ced3f825ad1266606997bbbd9))
* **deps:** bump marked in the prod-dependencies-minor group ([1860bc6](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/1860bc6d966c6b535f9adf44d276fb598f29f4f6))
* **deps:** update vite & jsdom prod dependencies ([e6a0cc7](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/e6a0cc72a6b185e4cae3478ea2ebd1f7747125e6))

## [0.4.5](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.4.4...v0.4.5) (2025-01-30)


### Bug Fixes

* **ctx:** export patched Document type to include Context on interface ([cd83567](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/cd83567379cbd88adc6b7d66858c352c7ece5d40))

## [0.4.4](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.4.3...v0.4.4) (2025-01-30)


### Features

* **ctx:** make context data object available on document ([fcfaa48](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/fcfaa489c45f5bd271d076bc8ca1b5d06f466978))

## [0.4.3](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.4.2...v0.4.3) (2025-01-29)


### Bug Fixes

* **deps:** bump the prod-dependencies-minor group across 1 directory with 2 updates ([d11eb83](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/d11eb8315f3b8ead0d59fda55288784cf4e9aa28))
* **deps:** bump vite from 5.4.11 to 5.4.14 ([81eaae0](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/81eaae098bf53015ca55d6888bb1e27d652126b0))

## [0.4.2](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.4.1...v0.4.2) (2024-12-18)


### Bug Fixes

* **deps-security:** bump nanoid from 3.3.7 to 3.3.8 ([b066d5c](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/b066d5c9c9503a6731f3aaa3c67439b6a42a5f11))
* **deps:** bump the prod-dependencies-minor group with 2 updates ([9d77e69](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/9d77e69372469b7319e23e2885c6820f30dd7a17))

## [0.4.1](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.4.0...v0.4.1) (2024-12-09)


### Bug Fixes

* include README in package ([cb04449](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/cb0444958fb9fe2196cff3ca2069af467846fba6))

## [0.4.0](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.3.4...v0.4.0) (2024-12-09)


### ⚠ BREAKING CHANGES

* switch vite to peer dep & update dev deps

* switch vite to peer dep & update dev deps ([d10c513](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/d10c513594771ede1a2f02a6469b62ef7619b099)), closes [#15](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/issues/15)

## [0.3.4](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.3.3...v0.3.4) (2024-11-29)


### Features

* support commonmarkdown directives ([a6c0265](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/a6c0265799cedae3106c34f389b646abbec283c8))

## [0.3.3](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.3.2...v0.3.3) (2024-11-20)


### Bug Fixes

* stop incorectly requiring serve field in excludes pattern validator ([a67c76b](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/a67c76b6fc103990bddb68bb6c7ac2bfc6c877d9))

## [0.3.2](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.3.1...v0.3.2) (2024-11-20)


### Bug Fixes

* update readme w/ sibling imports feature information ([333577a](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/333577abe82392add3c022678e5939c35d1ee022))

## [0.3.1](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.3.0...v0.3.1) (2024-11-20)


### Bug Fixes

* correct missed change to function on module instead of method on object ([9b506f8](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/9b506f86d8f25ef2735e475ecfd286256f3e81b3))
* dev server now handles add & removing files where previously it ignored the events ([4e7fc46](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/4e7fc46d95326ceb2f8430fe3f4e2c4ae3845471))

## [0.3.0](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.2.7...v0.3.0) (2024-11-20)


### ⚠ BREAKING CHANGES

* import sibling files of same name into resulting html (#7)

### Features

* import sibling files of same name into resulting html ([#7](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/issues/7)) ([0ed4982](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/0ed4982c2073a3b82253bf2d54fcf08d6935fb0a))

## [0.2.7](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.2.6...v0.2.7) (2024-11-20)


### Bug Fixes

* **frontmatter:** add page data to document in build ([02829d7](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/02829d701fd4440b1f4d7a899093ec180633d49e))

## [0.2.6](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.2.5...v0.2.6) (2024-11-20)


### Features

* frontmatter data populates head elements ([#6](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/issues/6)) ([a797c75](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/a797c757c3dc0553dd588bdb5483d7638731ba0d))

## [0.2.5](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.2.4...v0.2.5) (2024-11-15)


### Features

* make it possible to only specify a build exclusion ([71f83e7](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/71f83e791bb2724935e4a5b8facd86e601e25efe))

## [0.2.4](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.2.3...v0.2.4) (2024-11-14)


### Features

* index.html in root no longer necessary ([e3912bd](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/e3912bd5e2899835061a913f9c26dbc00e811ad3))


### Bug Fixes

* correct type of ExcludePatterns to allow single strings ([9f6a344](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/9f6a34420fe3fd3d35dc75deff44433c081042a0))

## [0.2.3](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.2.2...v0.2.3) (2024-11-14)


### Bug Fixes

* excludes is now optional ([d451be4](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/d451be44c24f88b962293bfa8e5386842c16830c))
* options object now optional ([9af3000](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/9af3000a99946e1ba3e8d1b555758030cb816c34))

## [0.2.2](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.2.1...v0.2.2) (2024-11-13)


### Features

* add excludes option for excluding files ([d6aaf99](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/d6aaf99e4ce01c7c9dfab8094e1928ca893512eb))

## [0.2.1](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.2.0...v0.2.1) (2024-11-13)


### Bug Fixes

* include logger customization on build & ensure setting info level if user supplied ([15935fb](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/15935fb83448fc4653c9d6d219de3ebf7a4db18a))

## [0.2.0](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.1.3...v0.2.0) (2024-11-13)


### Features

* default to warn logs only & allow user to customize log level ([3bddc86](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/3bddc86c4a6c9d5d2ba3b229113b7e9a42b8ed51))


### Bug Fixes

* stop adding duplicate leading slash on root level markdown imports ([e7048ad](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/e7048ada7a749573ea4354dbb3566000c2c7e51e))
* use js import extension per esm ([9b6d94f](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/9b6d94ff74002c4626ebec3810370b5fc0f5f7c4))

## [0.1.3](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.1.2...v0.1.3) (2024-11-12)


### Bug Fixes

* first-level subpages defined in markdown resolve id correctly ([34199fa](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/34199fa0f260ba83cc353e1127003b2bb8a192f4))
* prepublish hook now calls build script correctly ([2be402b](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/2be402ba51c61fa8e1519e6c8503cd6bbbb74952))
