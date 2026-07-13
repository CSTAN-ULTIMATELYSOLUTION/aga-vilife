import { describe, expect, it } from "vitest";
import { getBirthdayReading, getPhoneReading } from "./calculators";

describe("getPhoneReading", () => {
  it("asks for a phone number when the field is empty", () => {
    const result = getPhoneReading("+60", " ");

    expect(result.ok).toBe(false);
    expect(result.message).toBe("请输入手机号码。");
  });

  it("rejects phone input that contains letters", () => {
    const result = getPhoneReading("+60", "0183abc6003");

    expect(result.ok).toBe(false);
    expect(result.message).toBe("手机号码只能包含数字、空格或常用分隔符。");
  });

  it("rejects phone input that is too short", () => {
    const result = getPhoneReading("+60", "12345");

    expect(result.ok).toBe(false);
    expect(result.message).toBe("马来西亚号码需为 9 至 10 位数字。");
  });

  it("combines the selected country code with a valid local phone number", () => {
    const result = getPhoneReading("+60", "018-357 6003");

    expect(result.ok).toBe(true);
    expect(result.title).toBe("号码完整结果");
    expect(result.normalizedInput).toBe("+60183576003");
    expect(result.message).toContain("【梅花易数 - 电话号码分析】");
    expect(result.message).toContain("本卦：乾天（西北，金） / 坤地（西南，土）");
    expect(result.message).toContain("六亲：本卦 父母（吉），互卦 妻财（吉），变卦 父母（吉）");
    expect(result.breakdown).toHaveLength(7);
    expect(result.breakdown?.map((item) => item.label)).toEqual([
      "1. 本卦上卦",
      "2. 本卦下卦",
      "3. 动爻",
      "4. 互卦上卦",
      "5. 互卦下卦",
      "6. 变卦上卦",
      "7. 变卦下卦"
    ]);
    expect(result.breakdown?.map((item) => item.symbol)).toEqual(["☰", "☷", "☲", "☴", "☶", "☰", "☶"]);
  });

  it("accepts an 8 digit Singapore number", () => {
    const result = getPhoneReading("+65", "8123 4567");

    expect(result.ok).toBe(true);
    expect(result.normalizedInput).toBe("+6581234567");
  });

  it("rejects a Singapore number with Malaysia length", () => {
    const result = getPhoneReading("+65", "018 357 6003");

    expect(result.ok).toBe(false);
    expect(result.message).toBe("新加坡号码需为 8 位数字。");
  });

  it("accepts an 11 digit China number", () => {
    const result = getPhoneReading("+86", "138 0013 8000");

    expect(result.ok).toBe(true);
    expect(result.normalizedInput).toBe("+8613800138000");
  });

  it("accepts a Taiwan number after removing the trunk zero", () => {
    const result = getPhoneReading("+886", "0912 345 678");

    expect(result.ok).toBe(true);
    expect(result.normalizedInput).toBe("+886912345678");
  });

  it("accepts a US 10 digit number", () => {
    const result = getPhoneReading("+1", "(415) 555-2671");

    expect(result.ok).toBe(true);
    expect(result.normalizedInput).toBe("+14155552671");
  });
});

describe("getBirthdayReading", () => {
  it("asks for a birthday when the field is empty", () => {
    const result = getBirthdayReading("");

    expect(result.ok).toBe(false);
    expect(result.message).toBe("请选择出生日期。");
  });

  it("returns a numerology pyramid reading for a selected birthday", () => {
    const result = getBirthdayReading("1992-08-18");

    expect(result.ok).toBe(true);
    expect(result.title).toBe("生日完整结果");
    expect(result.normalizedInput).toBe("1992-08-18");
    expect(result.message).toContain("【生命灵数金字塔分析】");
    expect(result.message).toContain("生日：18/08/1992");
    expect(result.message).toContain("金字塔：1 8 0 8 1 9 9 2 / 9 8 1 2 / 8 3 / 2");
    expect(result.message).toContain("辅助三角：左 8 7 6；右 4 5 9；下 5 1 6");
  });
});
