const lintStagedConfig = {
  "*.{js,ts,jsx,tsx,css,json}": [
    "biome format --write",
    "biome lint --write --no-errors-on-unmatched",
  ],
};

export default lintStagedConfig;
