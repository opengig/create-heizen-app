export default {
  "*.{js,jsx,ts,tsx,mjs,json,md,mdx,css}": (files) => {
    // Filter out files in the templates directory
    const filteredFiles = files.filter((file) => !file.includes("/templates/"));

    if (filteredFiles.length === 0) {
      return [];
    }

    return [`prettier --write ${filteredFiles.join(" ")}`];
  },
};
