"use client";

import {
  Radio as ReactAriaRadio,
  RadioGroup as ReactAriaRadioGroup,
  type RadioGroupProps,
  type RadioProps,
} from "react-aria-components";

import { cn } from "@/ui/cn";

export function ChoiceGroup({ className, ...props }: RadioGroupProps) {
  return (
    <ReactAriaRadioGroup
      {...props}
      className={(state) =>
        cn(
          "dyrane-choice-group",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}

export function Choice({ className, ...props }: RadioProps) {
  return (
    <ReactAriaRadio
      {...props}
      className={(state) =>
        cn(
          "dyrane-choice",
          state.isSelected && "is-selected",
          state.isPressed && "is-pressed",
          state.isFocusVisible && "is-focus-visible",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}
