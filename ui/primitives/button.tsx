"use client";

import {
  Button as ReactAriaButton,
  type ButtonProps as ReactAriaButtonProps,
} from "react-aria-components";
import { cva } from "class-variance-authority";

import { cn } from "@/ui/cn";

export type ButtonProps = ReactAriaButtonProps & {
  tone?: "light" | "dark" | "quiet";
};

const buttonStyle = cva("dyrane-button", {
  variants: {
    tone: {
      dark: "dyrane-button--dark",
      light: "dyrane-button--light",
      quiet: "dyrane-button--quiet",
    },
  },
  defaultVariants: { tone: "dark" },
});

export function Button({
  className,
  tone = "dark",
  ...props
}: ButtonProps) {
  return (
    <ReactAriaButton
      {...props}
      className={(state) =>
        cn(
          buttonStyle({ tone }),
          state.isPressed && "is-pressed",
          state.isFocusVisible && "is-focus-visible",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}
