import { ChevronRight } from "lucide-react";
import { 
  Coupon, 
  CouponDisplayInfo, 
  CouponTemplateValue, 
  UsageRuleParams, 
  UsageRule 
} from "../types";


/**
 * 解析单个优惠券对象，生成用于前端展示的结构化信息。
 * @param {Coupon} coupon - 用户优惠券对象，必须包含嵌套的 coupon_templates 对象。
 * @returns {CouponDisplayInfo} - 包含主副标题和规则文案数组的对象。
 */
function parseCouponForDisplay(coupon: Coupon): CouponDisplayInfo {
  // 1. 初始化和解构
  if (!coupon || !coupon.coupon_templates) {
    console.error("无效的优惠券数据结构，缺少 coupon_templates", coupon);
    return {
      mainTitle: "无效的优惠券",
      subTitle: "",
      rules: [],
    };
  }

  const { coupon_templates: template, expires_at } = coupon;
  const rulesDisplay: Array<{ type: string; text: string }> = [];
  let mainTitle = template.name;
  let subTitle = "";

  // 2. 解析核心效果 (生成副标题)
  switch (template.type) {
    case "CASH_VOUCHER":
      subTitle = `价值${template.value.amount || 0}元`;
      break;
    case "PERCENTAGE_DISCOUNT":
      const discount = (100 - (template.value.percentage || 0)) / 10;
      subTitle = `享受${discount.toFixed(1)}折优惠`;
      if (template.value.max_off) {
        subTitle += `，最高优惠${template.value.max_off}元`;
      }
      break;
    case "FREE_ITEM":
      subTitle = `可兑换「${template.value.dish_name || "指定赠品"}」`;
      break;
    default:
      subTitle = "未知类型优惠";
  }

  // 3. 解析通用规则：有效期
  rulesDisplay.push({
    type: "VALIDITY",
    text: `有效期至: ${new Date(expires_at).toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
    })}`,
  });

  /**
   * 如果有 最高优惠金额 max_off
   * 则需要在 底部规则中新增一条 规则提示
   */
  if (template.value.max_off) {
    rulesDisplay.push({
      type: "MAX_OFF",
      text: subTitle,
    });
  }

  // 4. 解析 usage_rules 数组中的所有规则
  let hasEligibilityRule = false; // 标记是否存在范围限制规则
  if (template.usage_rules && template.usage_rules.length > 0) {
    template.usage_rules.forEach((rule) => {
      const params = rule.params as UsageRuleParams;

      switch (rule.rule_type) {
        case "MINIMUM_SPEND":
          if (params.min_spend && params.min_spend > 0) {
            rulesDisplay.push({
              type: "MINIMUM_SPEND",
              text: `满${params.min_spend}元可用`,
            });
          }
          break;
        case "ITEM_ELIGIBILITY":
          hasEligibilityRule = true; // 标记已找到范围规则
          if (params.required_items && params.required_items.length > 0) {
            const itemNames = params.required_items
              .map((item) => `「${item.name}」`)
              .join("、");
            rulesDisplay.push({
              type: "ITEM_ELIGIBILITY",
              text: `仅限${itemNames}商品可用`,
            });
          } else if (
            params.required_categories &&
            params.required_categories.length > 0
          ) {
            const categoryNames = params.required_categories
              .map((cat) => `「${cat.name}」`)
              .join("、");
            rulesDisplay.push({
              type: "ITEM_ELIGIBILITY",
              text: `仅限${categoryNames}可用`,
            });
          }
          break;

        case "GIFT_CONDITION":
          const conditions: string[] = [];

          // 检查并组合赠品获取条件
          if (params.required_items && params.required_items.length > 0) {
            const itemNames = params.required_items
              .map((item) => `「${item.name}」`)
              .join("、");
            conditions.push(`购买${itemNames}`);
          } else if (
            params.required_categories &&
            params.required_categories.length > 0
          ) {
            const categoryNames = params.required_categories
              .map((cat) => `「${cat.name}」`)
              .join("、");
            conditions.push(`购买任意${categoryNames}类商品`);
          }

          if (params.min_spend && params.min_spend > 0) {
            conditions.push(`消费满${params.min_spend}元`);
          }

          if (conditions.length > 0) {
            rulesDisplay.push({
              type: "GIFT_CONDITION",
              text: `${conditions.join("且")}可获赠`,
            });
          }
          break;
      }
    });
  }

  // 5. 解析默认规则和补充说明
  // 如果没有找到任何范围限制规则，且不是赠品券，则认为是全场通用
  if (!hasEligibilityRule && template.type !== "FREE_ITEM") {
    rulesDisplay.push({
      type: "DEFAULT_SCOPE",
      text:
        template.type === "PERCENTAGE_DISCOUNT"
          ? "折扣适用于全场商品"
          : "全场通用",
    });
  }

  // 6. 返回最终的结构化对象
  return { mainTitle, subTitle, rules: rulesDisplay };
}

export default function CouponList({ coupons }: { coupons: Coupon[] }) {
  return (
    <div className="space-y-3 p-4 max-w-2xl mx-auto">
      {coupons.map((coupon) => (
        <CouponCard key={coupon.id} coupon={coupon} />
      ))}
    </div>
  );
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  const isExpired = coupon.status === "EXPIRED";
  const isUsed = coupon.status === "USED";
  const expiryDate = new Date(coupon.expires_at);
  const isExpiringSoon =
    !isExpired &&
    !isUsed &&
    expiryDate.getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;

  // 使用 parseCouponForDisplay 生成结构化显示信息
  const displayInfo = parseCouponForDisplay(coupon);

  const getCouponValue = () => {
    const template = coupon.coupon_templates;
    switch (template.type) {
      case "CASH_VOUCHER":
        return `¥${template.value.amount}`;
      case "PERCENTAGE_DISCOUNT":
        const discount = template.value.percentage
          ? 10 - template.value.percentage / 10
          : 0;
        return `${discount}折`;
      case "FREE_ITEM":
        return `赠品「${template.value.dish_name || "指定赠品"}」`;
      default:
        return "";
    }
  };

  const getMinSpend = () => {
    const rules = coupon.coupon_templates.usage_rules;
    const minSpendRule = rules.find(
      (rule) => rule.rule_type === "MINIMUM_SPEND"
    );
    return minSpendRule?.params.min_spend ?? 0;
  };

  const getStatusStyle = () => {
    if (isExpired || isUsed) {
      return "bg-gray-100 opacity-60";
    }
    return "bg-white";
  };

  const getButtonStyle = () => {
    if (isExpired) {
      return "bg-gray-400 cursor-not-allowed";
    }
    if (isUsed) {
      return "bg-gray-400 cursor-not-allowed";
    }
    return "bg-red-500 hover:bg-red-600";
  };

  const getButtonText = () => {
    if (isExpired) return "已过期";
    if (isUsed) return "已使用";
    return "去使用";
  };

  return (
    <div className={`rounded-lg overflow-hidden shadow-sm ${getStatusStyle()}`}>
      {/* 红包标题部分 */}
      <div className="bg-red-50 px-4 py-2 flex items-center justify-between">
        <span className="text-sm text-red-500 font-medium">
          {displayInfo.mainTitle}
        </span>
        <span className="text-xs text-gray-500">
          {isExpiringSoon
            ? "今日到期"
            : `${expiryDate.getMonth() + 1}月${expiryDate.getDate()}日到期`}
        </span>
      </div>

      {/* 红包主体内容 */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-red-500">
                {getCouponValue()}
              </span>
              {getMinSpend() > 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  满{getMinSpend()}可用
                </span>
              )}
            </div>
          </div>
          <button
            className={`text-white px-4 py-1.5 rounded-full text-sm transition-colors ${getButtonStyle()}`}
            disabled={isExpired || isUsed}
            onClick={() => {
              /* TODO: Handle coupon usage */
            }}
          >
            {getButtonText()}
          </button>
        </div>

        {/* 使用规则部分 */}
        <div className="mt-3 border-t border-dashed border-gray-200 pt-2">
          <ul className="space-y-1">
            {displayInfo.rules.map((rule, index) => (
              <li
                key={index}
                className="text-xs text-gray-500 flex items-start"
              >
                <span className="mr-1">•</span>
                <span>{rule.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
