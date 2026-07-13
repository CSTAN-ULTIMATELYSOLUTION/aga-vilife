import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

beforeEach(() => {
  cleanup();
  const storage = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      clear: () => storage.clear(),
      getItem: (key: string) => storage.get(key) ?? null,
      removeItem: (key: string) => storage.delete(key),
      setItem: (key: string, value: string) => storage.set(key, value)
    }
  });
  localStorage.clear();
  window.history.pushState({}, "", "/");
});

describe("App calculator routes", () => {
  it("keeps calculator inputs off the homepage and links to dedicated pages", () => {
    render(<App />);

    expect(screen.queryByLabelText("手机号码")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("出生日期")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "手机号码测算" })).toHaveAttribute("href", "/phone");
    expect(screen.getByRole("link", { name: "生日命理分析" })).toHaveAttribute("href", "/birthday");
  });

  it("shows the full phone result on the phone page", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/phone");
    render(<App />);

    await user.type(screen.getByLabelText("手机号码"), "018 357 6003");
    await user.click(screen.getByRole("button", { name: "查看完整结果" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByText("号码完整结果").length).toBeGreaterThan(0);
    expect(
      screen.getByText((_, element) => element?.textContent?.includes("完整结论：整体偏吉，有利发展。") ?? false, {
        selector: "p"
      })
    ).toBeInTheDocument();
    expect(screen.getByText("7 个计算结果")).toBeInTheDocument();
    expect(screen.getByText("1. 本卦上卦")).toBeInTheDocument();
    expect(screen.getByText("7. 变卦下卦")).toBeInTheDocument();
    expect(
      Array.from(document.querySelectorAll(".phone-breakdown-grid > div")).map((item) => item.textContent?.trim() || "empty")
    ).toEqual([
      expect.stringContaining("1. 本卦上卦"),
      "empty",
      expect.stringContaining("4. 互卦上卦"),
      expect.stringContaining("6. 变卦上卦"),
      expect.stringContaining("2. 本卦下卦"),
      expect.stringContaining("3. 动爻"),
      expect.stringContaining("5. 互卦下卦"),
      expect.stringContaining("7. 变卦下卦")
    ]);
    expect(screen.getByText("未来 12 年走势")).toBeInTheDocument();
    expect(screen.getByText("2026")).toBeInTheDocument();
    expect(screen.getByText("2037")).toBeInTheDocument();
    expect(screen.getByText("2026 月度五行细看")).toBeInTheDocument();
    expect(screen.getByText("1月")).toBeInTheDocument();
    expect(screen.getByText("12月")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.textContent === "记录：+60183576003")).toBeInTheDocument();
  });

  it("shows the full birthday result on the birthday page", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/birthday");
    render(<App />);

    await user.type(screen.getByLabelText("出生日期"), "1999-05-27");
    await user.click(screen.getByRole("button", { name: "查看完整结果" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByText("生日完整结果").length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        (_, element) => element?.textContent?.includes("完整结论：已完成本命、流年与辅助三角计算") ?? false,
        { selector: "p" }
      )
    ).toBeInTheDocument();
  });
});

describe("Client portal", () => {
  it("shows an empty state when the email has no saved reports", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/client");
    render(<App />);

    await user.type(screen.getByLabelText("登录邮箱"), "empty@example.com");
    await user.click(screen.getByRole("button", { name: "进入客户中心" }));

    expect(screen.getByText("还没有报告")).toBeInTheDocument();
  });
});
