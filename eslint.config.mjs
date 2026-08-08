import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["ui/icons/**", "ui/motion/**", "ui/primitives/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "lucide-react",
              message: "Import functional icons from @/ui/icons.",
            },
            {
              name: "motion",
              message: "Import governed motion through @/ui/motion.",
            },
            {
              name: "motion/react",
              message: "Import governed motion through @/ui/motion.",
            },
            {
              name: "react-aria-components",
              message: "Import Dyrane behavior through @/ui/primitives.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
