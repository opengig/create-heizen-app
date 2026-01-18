module.exports = {
  types: [
    { value: "feat", name: "feat:     A new feature" },
    { value: "fix", name: "fix:      A bug fix" },
    { value: "docs", name: "docs:     Documentation only changes" },
    { value: "style", name: "style:    Code style changes (formatting, etc)" },
    { value: "refactor", name: "refactor: Code refactoring" },
    { value: "perf", name: "perf:     Performance improvements" },
    { value: "test", name: "test:     Adding or updating tests" },
    { value: "build", name: "build:    Build system or dependencies" },
    { value: "ci", name: "ci:       CI/CD configuration" },
    { value: "chore", name: "chore:    Other changes (non-src/test)" },
    { value: "revert", name: "revert:   Revert a commit" },
    { value: "config", name: "config:   Configuration changes" },
  ],

  scopes: [],
  allowCustomScopes: true,

  messages: {
    type: "Select the type of change you're committing:",
    scope: "Scope of this change (e.g. component, file):",
    subject: "Short description (imperative tense):\n",
    body: "Longer description (min 10 chars, required):\n",
    breaking: "List BREAKING CHANGES (optional):\n",
    footer: "Issues closed (e.g. #31, #34):\n",
    confirmCommit: "Proceed with this commit?",
  },

  // Skip breaking and footer prompts
  skipQuestions: ["breaking", "footer"],

  // Subject limit
  subjectLimit: 100,

  // Force body to be entered (can't skip with enter)
  allowBreakingChanges: ["feat", "fix"],
};
