import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";
import { PlusCircle } from "lucide-react";

const meta = {
  component: Button,
  argTypes: {
    type: {
      control: "radio",
      options: ["button", "submit", "link"],
      table: {
        readonly: true,
      },
    },
    label: {
      control: "text",
    },
    variant: {
      control: "radio",
      options: ["primary", "outline", "danger"],
    },
    size: {
      control: "radio",
      options: ["sm", "md"],
    },
    icon: { table: { disable: true } },
    iconPosition: {
      control: "radio",
      options: ["left", "right"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: "button",
    label: "Click me",
    variant: "primary",
    loading: false,
  },
};

export const Link: Story = {
  argTypes: {
    target: {
      control: "radio",
      options: ["_self", "_blank"],
    },
  },
  args: {
    type: "link",
    label: "Click me",
    variant: "primary",
    href: "https://www.google.com/",
    target: "_blank",
  },
};

export const WithIcon: Story = {
  args: {
    type: "button",
    label: "New item",
    variant: "primary",
    loading: false,
    icon: PlusCircle,
    iconPosition: "left",
  },
};
