import { ChevronRight } from 'lucide-react';
import { Coupon } from '../types';

export default function CouponList({ coupons }: { coupons: Coupon[] }) {
  return (
    <div className="space-y-3 p-4">
      {coupons.map((coupon) => (
        <CouponCard key={coupon.id} coupon={coupon} />
      ))}
    </div>
  );
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  const isExpired = coupon.status === 'EXPIRED';
  const isUsed = coupon.status === 'USED';
  const expiryDate = new Date(coupon.expires_at);
  const isExpiringSoon = !isExpired && !isUsed && 
    (expiryDate.getTime() - new Date().getTime() < 24 * 60 * 60 * 1000);

  const getCouponValue = () => {
    const template = coupon.coupon_templates;
    switch (template.type) {
      case 'CASH_VOUCHER':
        return `¥${template.value.amount}`;
      case 'PERCENTAGE_DISCOUNT':
        const discount = template.value.percentage ? (10 - template.value.percentage / 10) : 0;
        return `${discount}折`;
      case 'FREE_ITEM':
        return '赠品';
      default:
        return '';
    }
  };

  const getMinSpend = () => {
    const rules = coupon.coupon_templates.usage_rules;
    const minSpendRule = rules.find(rule => rule.rule_type === 'MINIMUM_SPEND');
    return minSpendRule?.params.amount ?? 0;
  };

  const getUsageRules = () => {
    const rules: string[] = [];
    const template = coupon.coupon_templates;
    
    // 基本使用规则
    const minSpend = getMinSpend();
    if (minSpend > 0) {
      rules.push(`限商品现价满${minSpend}元可用`);
    }

    // 特殊规则
    template.usage_rules.forEach(rule => {
      switch (rule.rule_type) {
        case 'VALID_DAYS_OF_WEEK':
          if (rule.params.days) {
            const dayNames = ['周日','周一','周二','周三','周四','周五','周六'];
            rules.push(`限${rule.params.days.map(d => dayNames[d]).join('、')}使用`);
          }
          break;
        case 'VALID_TIME_SLOTS':
          if (rule.params.slots) {
            rules.push(`限${rule.params.slots.map(s => `${s.start}-${s.end}`).join('、')}使用`);
          }
          break;
        case 'ITEM_DISCOUNT_SCOPE':
          rules.push('限部分商品使用');
          break;
        case 'STACKABILITY':
          if (rule.params.allow_stacking === false) {
            rules.push('不可与其他优惠叠加');
          }
          break;
        case 'CONDITIONAL_GIFT_ITEM':
          rules.push(`购买指定商品可用`);
          break;
      }
    });

    return rules;
  };

  const getStatusStyle = () => {
    if (isExpired || isUsed) {
      return 'bg-gray-100 opacity-60';
    }
    return 'bg-white';
  };

  const getButtonStyle = () => {
    if (isExpired) {
      return 'bg-gray-400 cursor-not-allowed';
    }
    if (isUsed) {
      return 'bg-gray-400 cursor-not-allowed';
    }
    return 'bg-red-500 hover:bg-red-600';
  };

  const getButtonText = () => {
    if (isExpired) return '已过期';
    if (isUsed) return '已使用';
    return '去使用';
  };

  return (
    <div className={`rounded-lg overflow-hidden shadow-sm ${getStatusStyle()}`}>
      {/* 红包标题部分 */}
      <div className="bg-red-50 px-4 py-2 flex items-center justify-between">
        <span className="text-sm text-red-500 font-medium">
          {coupon.coupon_templates.name}
        </span>
        <span className="text-xs text-gray-500">
          {isExpiringSoon ? '今日到期' : `${expiryDate.getMonth() + 1}月${expiryDate.getDate()}日到期`}
        </span>
      </div>

      {/* 红包主体内容 */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-red-500">{getCouponValue()}</span>
              {getMinSpend() > 0 && (
                <span className="ml-2 text-sm text-gray-500">满{getMinSpend()}可用</span>
              )}
            </div>
          </div>
          <button 
            className={`text-white px-4 py-1.5 rounded-full text-sm transition-colors ${getButtonStyle()}`}
            disabled={isExpired || isUsed}
            onClick={() => {/* TODO: Handle coupon usage */}}
          >
            {getButtonText()}
          </button>
        </div>

        {/* 使用规则部分 */}
        <div className="mt-3 border-t border-dashed border-gray-200 pt-2">
          <ul className="space-y-1">
            {getUsageRules().map((rule, index) => (
              <li key={index} className="text-xs text-gray-500 flex items-start">
                <span className="mr-1">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 