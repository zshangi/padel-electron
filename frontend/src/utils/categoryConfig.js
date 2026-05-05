export const mainCategoryConfig = [
    {
        value: '1',
        label: 'دسته بندی زمین ها و جایگاه ها',
        content: [
          { key: 'mainprice', label: 'نرخ پایه ', type: 'currency' },
        //   { key: 'capacity', label: 'ظرفیت زمین یا جایگاه در هر سانس', type: 'number' },
          { key: 'time', label: 'مدت زمان سانس (دقیقه)', type: 'number' },
        //   { key: 'numbersans', label: 'تعداد سانس قابل رزرو', type: 'number' },
          { key: 'supportmobile', label: 'تلفن کنسلی', type: 'number' }
        ]
      },

    {
        value: '2',
        label: 'دسته بندی مربیان',
        content: [
            { key: 'couchprice', label: 'هزینه هر جلسه  ', type: 'currency' },
            { key: 'courtprice', label: 'هزینه رزرو زمین ', type: 'currency' },
            { key: 'mainprice', label: 'هزینه رزرو زمین + مربی ', type: 'currency' },
            { key: 'gympercent', label: 'درصد باشگاه', type: 'number' },
            { key: 'couchpercent', label: 'درصد مربی', type: 'number' },
          ]
    },


    {
        value: '3',
        label: 'دسته بندی پکیج ها',
        content: [
            { key: 'packageprice', label: 'هزینه هر جلسه  ', type: 'currency' },
            { key: 'gympercent', label: 'درصد تخفیف', type: 'number' },
          ]
    },

];

export const normalizeDigitsToEnglish = (value) => {
  if (value === null || value === undefined) return value;
  if (typeof value !== "string" && typeof value !== "number") return value;

  const input = String(value);
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

  return input.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = persianDigits.indexOf(digit);
    if (persianIndex > -1) return String(persianIndex);
    const arabicIndex = arabicDigits.indexOf(digit);
    if (arabicIndex > -1) return String(arabicIndex);
    return digit;
  });
};

export const normalizeNumericFieldsByConfig = (values, categoryConfig) => {
  if (!values || !categoryConfig?.content) return values || {};

  const normalized = { ...values };
  categoryConfig.content.forEach((field) => {
    if (field.type === "number" && Object.prototype.hasOwnProperty.call(normalized, field.key)) {
      normalized[field.key] = normalizeDigitsToEnglish(normalized[field.key]);
    }
  });

  return normalized;
};
