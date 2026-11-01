// The user confirmed quote-on-request; no fixed commercial amount is approved.
export const bespokePricing = {
  status: 'quote-on-request' as 'pending' | 'quote-on-request',
  heading: '按需求报价',
  description: '根据影片用途、资料情况、制作复杂度与交付版本评估。沟通需求后，再确认创作方案、服务范围和报价。',
  scope: [
    { title: '创作内容', description: '围绕真实资料，沟通故事策划、影像设计、制作与后期的具体工作。' },
    { title: '成果范围', description: '片长、画幅、字幕、短版及修改范围，按项目逐项确认。' },
    { title: '评估依据', description: '结合资料完整度、制作复杂度、交付版本和时间安排评估。' },
  ],
};
