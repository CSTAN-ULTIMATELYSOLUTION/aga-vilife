export type ReadingResult = {
  ok: boolean;
  title: string;
  message: string;
  normalizedInput?: string;
  breakdown?: CalculationBreakdownItem[];
};

export type CalculationBreakdownItem = {
  label: string;
  value: string;
  detail: string;
  symbol: string;
};

type Trigram = {
  name: string;
  nameEn: string;
  meaning: string;
  direction: string;
  element: number;
  elementName: string;
  lines: [number, number, number];
};

type SixRelation = {
  name: string;
  nameEn: string;
  fortune: string;
};

type PhoneCountryRule = {
  label: string;
  minLength: number;
  maxLength: number;
  stripLeadingZero: boolean;
};

const phoneCountryRules: Record<string, PhoneCountryRule> = {
  "+60": { label: "马来西亚", minLength: 9, maxLength: 10, stripLeadingZero: true },
  "+65": { label: "新加坡", minLength: 8, maxLength: 8, stripLeadingZero: false },
  "+86": { label: "中国", minLength: 11, maxLength: 11, stripLeadingZero: false },
  "+852": { label: "香港", minLength: 8, maxLength: 8, stripLeadingZero: false },
  "+886": { label: "台湾", minLength: 9, maxLength: 9, stripLeadingZero: true },
  "+1": { label: "美国", minLength: 10, maxLength: 10, stripLeadingZero: false }
};

const trigrams: Record<number, Trigram> = {
  1: { name: "乾", nameEn: "Qian", meaning: "天", direction: "西北", element: 1, elementName: "金", lines: [1, 1, 1] },
  2: { name: "兑", nameEn: "Dui", meaning: "泽", direction: "正西", element: 1, elementName: "金", lines: [0, 1, 1] },
  3: { name: "离", nameEn: "Li", meaning: "火", direction: "正南", element: 4, elementName: "火", lines: [1, 0, 1] },
  4: { name: "震", nameEn: "Zhen", meaning: "雷", direction: "正东", element: 3, elementName: "木", lines: [0, 0, 1] },
  5: { name: "巽", nameEn: "Xun", meaning: "风", direction: "东南", element: 3, elementName: "木", lines: [1, 1, 0] },
  6: { name: "坎", nameEn: "Kan", meaning: "水", direction: "正北", element: 2, elementName: "水", lines: [0, 1, 0] },
  7: { name: "艮", nameEn: "Gen", meaning: "山", direction: "东北", element: 5, elementName: "土", lines: [1, 0, 0] },
  8: { name: "坤", nameEn: "Kun", meaning: "地", direction: "西南", element: 5, elementName: "土", lines: [0, 0, 0] }
};

const trigramSymbols: Record<number, string> = {
  1: "☰",
  2: "☱",
  3: "☲",
  4: "☳",
  5: "☴",
  6: "☵",
  7: "☶",
  8: "☷"
};

const sixRelations: Record<number, SixRelation> = {
  1: { name: "父母", nameEn: "Parents", fortune: "吉" },
  0: { name: "兄弟", nameEn: "Siblings", fortune: "吉" },
  5: { name: "兄弟", nameEn: "Siblings", fortune: "吉" },
  4: { name: "子孙", nameEn: "Descendants", fortune: "凶" },
  [-1]: { name: "子孙", nameEn: "Descendants", fortune: "凶" },
  3: { name: "妻财", nameEn: "Wife/Wealth", fortune: "吉" },
  [-2]: { name: "妻财", nameEn: "Wife/Wealth", fortune: "吉" },
  2: { name: "官鬼", nameEn: "Officials/Ghosts", fortune: "凶" },
  [-3]: { name: "官鬼", nameEn: "Officials/Ghosts", fortune: "凶" }
};

function formatLengthRule(rule: PhoneCountryRule) {
  if (rule.minLength === rule.maxLength) {
    return `${rule.label}号码需为 ${rule.minLength} 位数字。`;
  }

  return `${rule.label}号码需为 ${rule.minLength} 至 ${rule.maxLength} 位数字。`;
}

function reduceToSingleDigit(num: number) {
  let current = num;

  while (current > 9) {
    current = String(current)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }

  return current;
}

function linesToNumber(lines: number[]) {
  const match = Object.entries(trigrams).find(([, trigram]) =>
    trigram.lines.every((line, index) => line === lines[index])
  );

  return match ? Number(match[0]) : 1;
}

function calculateBagua(phone: string) {
  const digits = phone.split("").map((digit) => (digit === "0" ? 8 : Number(digit)));
  const firstFive = digits.slice(0, 5);
  const lastDigits = digits.slice(5);

  const output1 = firstFive.reduce((sum, digit) => sum + digit, 0) % 8 || 8;
  const output2 = lastDigits.reduce((sum, digit) => sum + digit, 0) % 8 || 8;
  const output3 = digits.reduce((sum, digit) => sum + digit, 0) % 6 || 6;

  const combined = [...trigrams[output1].lines, ...trigrams[output2].lines];
  const output4 = linesToNumber([combined[1], combined[2], combined[3]]);
  const output5 = linesToNumber([combined[2], combined[3], combined[4]]);

  const flipped = [...combined];
  flipped[6 - output3] = 1 - flipped[6 - output3];

  const output6 = linesToNumber(flipped.slice(0, 3));
  const output7 = linesToNumber(flipped.slice(3));
  const output8 = output3 <= 3 ? "体" : "用";
  const output9 = output3 <= 3 ? "用" : "体";

  const diffFor = (left: number, right: number) =>
    output8 === "体" ? trigrams[left].element - trigrams[right].element : trigrams[right].element - trigrams[left].element;
  const relationFor = (diff: number) =>
    sixRelations[diff] ?? sixRelations[((diff % 5) + 5) % 5] ?? { name: "未知", nameEn: "Unknown", fortune: "" };

  const relation10 = relationFor(diffFor(output1, output2));
  const relation11 = relationFor(diffFor(output4, output5));
  const relation12 = relationFor(diffFor(output6, output7));

  return {
    phone,
    original: { upper: output1, lower: output2, movingLine: output3, relation: relation10 },
    mutual: { upper: output4, lower: output5, relation: relation11 },
    changed: { upper: output6, lower: output7, relation: relation12 },
    bodyUse: { first: output8, second: output9 }
  };
}

function formatTrigram(number: number) {
  const trigram = trigrams[number];
  return `${trigram.name}${trigram.meaning}（${trigram.direction}，${trigram.elementName}）`;
}

function formatTrigramBreakdown(label: string, number: number): CalculationBreakdownItem {
  const trigram = trigrams[number];

  return {
    label,
    value: `${number} - ${trigram.name}${trigram.meaning}`,
    detail: `${trigram.direction} · ${trigram.elementName}`,
    symbol: trigramSymbols[number]
  };
}

function formatPhoneBreakdown(phone: string): CalculationBreakdownItem[] {
  const result = calculateBagua(phone);

  return [
    formatTrigramBreakdown("1. 本卦上卦", result.original.upper),
    formatTrigramBreakdown("2. 本卦下卦", result.original.lower),
    {
      label: "3. 动爻",
      value: String(result.original.movingLine),
      detail: `体用：${result.bodyUse.first} / ${result.bodyUse.second}`,
      symbol: trigramSymbols[result.original.movingLine]
    },
    formatTrigramBreakdown("4. 互卦上卦", result.mutual.upper),
    formatTrigramBreakdown("5. 互卦下卦", result.mutual.lower),
    formatTrigramBreakdown("6. 变卦上卦", result.changed.upper),
    formatTrigramBreakdown("7. 变卦下卦", result.changed.lower)
  ];
}

function formatBaguaReading(phone: string) {
  const result = calculateBagua(phone);
  const fortunes = [result.original.relation.fortune, result.mutual.relation.fortune, result.changed.relation.fortune];
  const luckyCount = fortunes.filter((fortune) => fortune === "吉").length;
  const unluckyCount = fortunes.filter((fortune) => fortune === "凶").length;
  const fortuneText =
    luckyCount > unluckyCount ? "整体偏吉，有利发展。" : unluckyCount > luckyCount ? "整体偏凶，建议谨慎选择。" : "吉凶参半，适合进一步细看用途。";

  return [
    "【梅花易数 - 电话号码分析】",
    `本卦：${formatTrigram(result.original.upper)} / ${formatTrigram(result.original.lower)}`,
    `互卦：${formatTrigram(result.mutual.upper)} / ${formatTrigram(result.mutual.lower)}`,
    `变卦：${formatTrigram(result.changed.upper)} / ${formatTrigram(result.changed.lower)}`,
    `动爻：${result.original.movingLine}；体用：${result.bodyUse.first} / ${result.bodyUse.second}`,
    `六亲：本卦 ${result.original.relation.name}（${result.original.relation.fortune}），互卦 ${result.mutual.relation.name}（${result.mutual.relation.fortune}），变卦 ${result.changed.relation.name}（${result.changed.relation.fortune}）`,
    `完整结论：${fortuneText}`
  ].join("\n");
}

function calculatePyramid(birthday: string) {
  const [dayInput, monthInput, year] = birthday.split("/");
  const day = dayInput.padStart(2, "0");
  const month = monthInput.padStart(2, "0");
  const row1 = `${day}${month}${year}`.split("").map(Number);
  const pyramid = [row1];
  let currentRow = row1;

  while (currentRow.length > 1) {
    const nextRow: number[] = [];

    for (let index = 0; index < currentRow.length; index += 2) {
      if (index + 1 < currentRow.length) {
        const isYear2000SpecialCase =
          year === "2000" && currentRow.length === 8 && index === 6 && currentRow[index] === 0 && currentRow[index + 1] === 0;
        nextRow.push(isYear2000SpecialCase ? 5 : reduceToSingleDigit(currentRow[index] + currentRow[index + 1]));
      }
    }

    pyramid.push(nextRow);
    currentRow = nextRow;
  }

  return pyramid;
}

function calculateSmallTriangles(pyramid: number[][]) {
  if (pyramid.length < 4) {
    return null;
  }

  const row2 = pyramid[1];
  const row3 = pyramid[2];
  const row4 = pyramid[3];
  const left1 = reduceToSingleDigit(row2[0] + row3[0]);
  const left2 = reduceToSingleDigit(row2[1] + row3[0]);
  const right1 = reduceToSingleDigit(row2[2] + row3[1]);
  const right2 = reduceToSingleDigit(row2[3] + row3[1]);
  const bottom1 = reduceToSingleDigit(row3[1] + row4[0]);
  const bottom2 = reduceToSingleDigit(row3[0] + row4[0]);

  return {
    left: [left1, left2, reduceToSingleDigit(left1 + left2)],
    right: [right1, right2, reduceToSingleDigit(right1 + right2)],
    bottom: [bottom1, bottom2, reduceToSingleDigit(bottom1 + bottom2)]
  };
}

function formatBirthdayForPyramid(birthday: string) {
  const [year, month, day] = birthday.split("-");
  return `${day}/${month}/${year}`;
}

function formatPyramidReading(birthday: string) {
  const formattedBirthday = formatBirthdayForPyramid(birthday);
  const pyramid = calculatePyramid(formattedBirthday);
  const smallTriangles = calculateSmallTriangles(pyramid);
  const currentYearBirthday = formattedBirthday.replace(/\/\d{4}$/, `/${new Date().getFullYear()}`);
  const currentYearPyramid = calculatePyramid(currentYearBirthday);

  return [
    "【生命灵数金字塔分析】",
    `生日：${formattedBirthday}`,
    `金字塔：${pyramid.map((row) => row.join(" ")).join(" / ")}`,
    smallTriangles
      ? `辅助三角：左 ${smallTriangles.left.join(" ")}；右 ${smallTriangles.right.join(" ")}；下 ${smallTriangles.bottom.join(" ")}`
      : "",
    `本命核心：${pyramid.at(-1)?.[0] ?? "-"}；${new Date().getFullYear()} 流年核心：${currentYearPyramid.at(-1)?.[0] ?? "-"}`,
    "完整结论：已完成本命、流年与辅助三角计算，可用于整理当前节奏与生活建议。"
  ]
    .filter(Boolean)
    .join("\n");
}

export function getPhoneReading(countryCode: string, phoneNumber: string): ReadingResult {
  const trimmedPhone = phoneNumber.trim();
  const countryDigits = countryCode.replace(/\D/g, "");
  const rule = phoneCountryRules[countryCode] ?? phoneCountryRules["+60"];

  if (!trimmedPhone) {
    return {
      ok: false,
      title: "需要手机号码",
      message: "请输入手机号码。"
    };
  }

  if (!/^[\d\s().-]+$/.test(trimmedPhone)) {
    return {
      ok: false,
      title: "号码格式不正确",
      message: "手机号码只能包含数字、空格或常用分隔符。"
    };
  }

  const enteredDigits = trimmedPhone.replace(/\D/g, "");
  const localDigits = rule.stripLeadingZero ? enteredDigits.replace(/^0+/, "") : enteredDigits;

  if (localDigits.length < rule.minLength || localDigits.length > rule.maxLength) {
    return {
      ok: false,
      title: "号码长度不正确",
      message: formatLengthRule(rule)
    };
  }

  const normalizedInput = `+${countryDigits}${localDigits}`;
  const formulaPhone = countryCode === "+60" ? (enteredDigits.startsWith("0") ? enteredDigits : `0${localDigits}`) : localDigits;

  return {
    ok: true,
    title: "号码完整结果",
    normalizedInput,
    message: formatBaguaReading(formulaPhone),
    breakdown: formatPhoneBreakdown(formulaPhone)
  };
}

export function getBirthdayReading(birthday: string): ReadingResult {
  if (!birthday) {
    return {
      ok: false,
      title: "需要出生日期",
      message: "请选择出生日期。"
    };
  }

  return {
    ok: true,
    title: "生日完整结果",
    normalizedInput: birthday,
    message: formatPyramidReading(birthday)
  };
}
