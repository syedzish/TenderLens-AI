import type { AppLanguage } from "@/lib/chat";
import type { ComplianceResult } from "@/lib/compliance";

export const DEMO_FILE_NAMES = [
  "riyadh-smart-parking-rfp.pdf",
  "najm-urban-mobility-proposal.docx",
  "technical-compliance-addendum.pdf",
];

export const DEMO_ANALYSIS_EN: ComplianceResult = {
  score: 75,
  executiveBrief:
    "The proposal is strong on language support, uptime, data residency, support, APIs, and sustainability reporting. It still needs clarification on bid security validity, security evidence, go-live timing, and training seats before submission.",
  matrix: [
    {
      requirement: "Bid security must equal 2% of contract value and remain valid for at least 120 days.",
      category: "Commercial",
      status: "Partial",
      risk: "Medium",
      response: "The proposal provides 2% bid security, but the validity period is 90 days unless extended during clarification.",
      citations: [
        {
          file: "najm-urban-mobility-proposal.docx",
          quote: "Bid security: 2% of contract value, valid for 90 days from submission.",
        },
      ],
    },
    {
      requirement: "Portal, resident notifications, and enforcement interface must support Arabic and English.",
      category: "Functional",
      status: "Compliant",
      risk: "Low",
      response: "The proposal confirms Arabic and English support across operator, resident, and enforcement workflows.",
      citations: [
        {
          file: "najm-urban-mobility-proposal.docx",
          quote: "The operator portal and resident notifications are available in Arabic and English.",
        },
      ],
    },
    {
      requirement: "Hosted production service must meet 99.5% monthly uptime with 72-hour maintenance notice.",
      category: "SLA",
      status: "Compliant",
      risk: "Low",
      response: "The proposal and addendum commit to 99.5% uptime and 72-hour scheduled maintenance notice.",
      citations: [
        {
          file: "technical-compliance-addendum.pdf",
          quote: "Najm commits to 99.5% monthly uptime for the hosted production service.",
        },
      ],
    },
    {
      requirement: "Supplier must provide ISO 27001, SOC 2 Type II, or equivalent independent security audit evidence.",
      category: "Security",
      status: "Partial",
      risk: "Medium",
      response: "An independent penetration test is available, but ISO 27001 certification is not yet issued.",
      citations: [
        {
          file: "technical-compliance-addendum.pdf",
          quote: "ISO 27001 certification is scheduled for final audit in Q4 2026 and is not yet issued.",
        },
      ],
    },
    {
      requirement: "Production go-live for the five pilot districts must be completed by 30 September 2026.",
      category: "Delivery",
      status: "Partial",
      risk: "High",
      response: "The proposed go-live date is 15 October 2026, which is after the mandatory deadline.",
      citations: [
        {
          file: "najm-urban-mobility-proposal.docx",
          quote: "Go-live is planned for 15 October 2026 after staged district acceptance.",
        },
      ],
    },
    {
      requirement: "Resident personal data and plate metadata must be stored in Saudi Arabia.",
      category: "Data Residency",
      status: "Compliant",
      risk: "Low",
      response: "Production data and backups are committed to a Riyadh/KSA hosting location.",
      citations: [
        {
          file: "technical-compliance-addendum.pdf",
          quote: "Backups will remain within the Kingdom of Saudi Arabia.",
        },
      ],
    },
    {
      requirement: "Critical incidents need human response within 30 minutes and standard tickets within 4 business hours.",
      category: "Support",
      status: "Compliant",
      risk: "Low",
      response: "The proposal and addendum meet both incident and standard ticket response targets.",
      citations: [
        {
          file: "technical-compliance-addendum.pdf",
          quote: "Critical production incidents receive a named support engineer within 30 minutes.",
        },
      ],
    },
    {
      requirement: "Platform must integrate with the municipal payment gateway and expose REST APIs.",
      category: "Integration",
      status: "Compliant",
      risk: "Low",
      response: "The proposal includes payment gateway integration and REST APIs for occupancy, permits, violations, and payments.",
      citations: [
        {
          file: "najm-urban-mobility-proposal.docx",
          quote: "Najm exposes REST APIs for occupancy, permits, violation status, and payment events.",
        },
      ],
    },
    {
      requirement: "Supplier must deliver role-based training for at least 50 municipal staff before go-live.",
      category: "Training",
      status: "Partial",
      risk: "Medium",
      response: "The base proposal includes 40 trainees. Ten additional remote trainees may be added at no license cost.",
      citations: [
        {
          file: "technical-compliance-addendum.pdf",
          quote: "Najm can add 10 additional trainees at no license cost if training is delivered remotely.",
        },
      ],
    },
    {
      requirement: "Supplier must provide quarterly sustainability reporting.",
      category: "Reporting",
      status: "Compliant",
      risk: "Low",
      response: "The addendum commits to quarterly sustainability reports covering energy profile and maintenance trips.",
      citations: [
        {
          file: "technical-compliance-addendum.pdf",
          quote: "Najm will submit a quarterly sustainability report covering cloud hosting region energy profile.",
        },
      ],
    },
  ],
  trace: ["Validated files", "Found mandatory requirements", "Matched evidence", "Calibrated risks"],
  risks: [
    "Go-live is later than the mandatory deadline.",
    "Bid security validity is shorter than requested.",
    "ISO 27001 certification is not yet issued.",
    "Training reaches 50 seats only if remote additional trainees are accepted.",
  ],
  nextActions: [
    "Request a revised go-live plan that meets 30 September 2026.",
    "Ask for written confirmation extending bid security validity to 120 days.",
    "Confirm whether the March 2026 penetration test is accepted as equivalent security evidence.",
    "Confirm that 50 training seats are included before go-live.",
  ],
};

export const DEMO_ANALYSIS_AR: ComplianceResult = {
  score: 75,
  executiveBrief:
    "العرض قوي في دعم اللغتين، التوافر، استضافة البيانات داخل المملكة، الدعم، واجهات API، وتقارير الاستدامة. لكنه يحتاج توضيحا قبل التقديم حول صلاحية ضمان العطاء، أدلة الأمن، تاريخ الإطلاق، وعدد مقاعد التدريب.",
  matrix: [
    {
      requirement: "يجب أن يساوي ضمان العطاء 2% من قيمة العقد وأن يبقى صالحا لمدة 120 يوما على الأقل.",
      category: "تجاري",
      status: "Partial",
      risk: "Medium",
      response: "العرض يوفر ضمان عطاء بنسبة 2%، لكن الصلاحية المذكورة 90 يوما فقط ما لم يتم تمديدها أثناء التوضيح.",
      citations: [{ file: "najm-urban-mobility-proposal.docx", quote: "Bid security: 2% of contract value, valid for 90 days from submission." }],
    },
    {
      requirement: "يجب أن تدعم البوابة والإشعارات وواجهة التفتيش اللغتين العربية والإنجليزية.",
      category: "وظيفي",
      status: "Compliant",
      risk: "Low",
      response: "العرض يؤكد دعم العربية والإنجليزية في بوابة المشغل وإشعارات السكان وواجهة المفتش.",
      citations: [{ file: "najm-urban-mobility-proposal.docx", quote: "The operator portal and resident notifications are available in Arabic and English." }],
    },
    {
      requirement: "يجب أن تحقق الخدمة المستضافة توافرا شهريا بنسبة 99.5% مع إشعار صيانة قبل 72 ساعة.",
      category: "اتفاقية الخدمة",
      status: "Compliant",
      risk: "Low",
      response: "العرض والملحق يلتزمان بنسبة التوافر المطلوبة وإشعار الصيانة قبل 72 ساعة.",
      citations: [{ file: "technical-compliance-addendum.pdf", quote: "Najm commits to 99.5% monthly uptime for the hosted production service." }],
    },
    {
      requirement: "يجب تقديم شهادة ISO 27001 أو SOC 2 Type II أو تدقيق أمني مستقل مكافئ.",
      category: "الأمن",
      status: "Partial",
      risk: "Medium",
      response: "يوجد اختبار اختراق مستقل، لكن شهادة ISO 27001 لم تصدر بعد.",
      citations: [{ file: "technical-compliance-addendum.pdf", quote: "ISO 27001 certification is scheduled for final audit in Q4 2026 and is not yet issued." }],
    },
    {
      requirement: "يجب إكمال الإطلاق التشغيلي للمناطق الخمس قبل 30 سبتمبر 2026.",
      category: "التسليم",
      status: "Partial",
      risk: "High",
      response: "تاريخ الإطلاق المقترح هو 15 أكتوبر 2026، وهو بعد الموعد الإلزامي.",
      citations: [{ file: "najm-urban-mobility-proposal.docx", quote: "Go-live is planned for 15 October 2026 after staged district acceptance." }],
    },
    {
      requirement: "يجب تخزين بيانات السكان وبيانات اللوحات داخل المملكة العربية السعودية.",
      category: "إقامة البيانات",
      status: "Compliant",
      risk: "Low",
      response: "البيانات التشغيلية والنسخ الاحتياطية ستبقى داخل المملكة.",
      citations: [{ file: "technical-compliance-addendum.pdf", quote: "Backups will remain within the Kingdom of Saudi Arabia." }],
    },
    {
      requirement: "يجب الرد البشري على الحوادث الحرجة خلال 30 دقيقة وعلى التذاكر العادية خلال 4 ساعات عمل.",
      category: "الدعم",
      status: "Compliant",
      risk: "Low",
      response: "العرض والملحق يطابقان أهداف الاستجابة للحوادث الحرجة والتذاكر العادية.",
      citations: [{ file: "technical-compliance-addendum.pdf", quote: "Critical production incidents receive a named support engineer within 30 minutes." }],
    },
    {
      requirement: "يجب التكامل مع بوابة الدفع البلدية وتوفير واجهات REST APIs.",
      category: "التكامل",
      status: "Compliant",
      risk: "Low",
      response: "العرض يتضمن تكامل بوابة الدفع وواجهات REST APIs للإشغال والتصاريح والمخالفات والمدفوعات.",
      citations: [{ file: "najm-urban-mobility-proposal.docx", quote: "Najm exposes REST APIs for occupancy, permits, violation status, and payment events." }],
    },
    {
      requirement: "يجب تدريب 50 موظفا بلديا على الأقل قبل الإطلاق.",
      category: "التدريب",
      status: "Partial",
      risk: "Medium",
      response: "العرض الأساسي يغطي 40 متدربا، ويمكن إضافة 10 متدربين عن بعد دون تكلفة ترخيص.",
      citations: [{ file: "technical-compliance-addendum.pdf", quote: "Najm can add 10 additional trainees at no license cost if training is delivered remotely." }],
    },
    {
      requirement: "يجب تقديم تقرير استدامة ربع سنوي.",
      category: "التقارير",
      status: "Compliant",
      risk: "Low",
      response: "الملحق يلتزم بتقرير ربع سنوي يغطي ملف طاقة الاستضافة ورحلات صيانة الأجهزة.",
      citations: [{ file: "technical-compliance-addendum.pdf", quote: "Najm will submit a quarterly sustainability report covering cloud hosting region energy profile." }],
    },
  ],
  trace: ["تم التحقق من الملفات", "تم العثور على المتطلبات الإلزامية", "تمت مطابقة الأدلة", "تم ضبط مستوى المخاطر"],
  risks: ["تاريخ الإطلاق بعد الموعد الإلزامي.", "صلاحية ضمان العطاء أقصر من المطلوب.", "شهادة ISO 27001 لم تصدر بعد.", "الوصول إلى 50 مقعدا تدريبيا يعتمد على قبول التدريب عن بعد."],
  nextActions: ["اطلب خطة إطلاق معدلة تلتزم بتاريخ 30 سبتمبر 2026.", "اطلب تأكيدا مكتوبا بتمديد ضمان العطاء إلى 120 يوما.", "أكد ما إذا كان اختبار الاختراق في مارس 2026 مقبولا كدليل أمني مكافئ.", "أكد أن 50 مقعدا تدريبيا مشمولة قبل الإطلاق."],
};

export function getDemoAnalysis(language: AppLanguage): ComplianceResult {
  return language === "ar" ? DEMO_ANALYSIS_AR : DEMO_ANALYSIS_EN;
}

export function isDemoFileSet(fileNames: string[]): boolean {
  const normalize = (fileName: string) => fileName.toLowerCase().replace(/[_\s]+/g, "-");
  const normalized = fileNames.map(normalize).sort();
  const expected = [...DEMO_FILE_NAMES].sort();
  return normalized.length === expected.length && expected.every((name, index) => normalized[index] === name);
}
