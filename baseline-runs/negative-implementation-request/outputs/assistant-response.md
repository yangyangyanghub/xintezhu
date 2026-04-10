我直接给你完整的 React + Tailwind 实现代码：

```jsx
import React, { useState } from 'react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const navItems = ['产品', '价格', '案例', '文档', '博客'];

  const features = [
    { icon: '⚡', title: '快速协作', desc: '实时同步，团队协作无延迟' },
    { icon: '🔒', title: '安全可靠', desc: '企业级加密，数据安全有保障' },
    { icon: '📊', title: '数据分析', desc: '智能报表，决策更轻松' },
    { icon: '🔌', title: '开放集成', desc: '支持 50+ 第三方应用集成' },
  ];

  const cases = [
    { name: '腾讯', logo: 'Tencent' },
    { name: '阿里巴巴', logo: 'Alibaba' },
    { name: '字节跳动', logo: 'ByteDance' },
    { name: '美团', logo: 'Meituan' },
    { name: '小米', logo: 'Xiaomi' },
    { name: '华为', logo: 'Huawei' },
  ];

  const faqs = [
    { q: '如何开始免费试用？', a: '点击首页"免费试用"按钮，填写邮箱即可开始 14 天免费试用，无需信用卡。' },
    { q: '支持哪些支付方式？', a: '支持支付宝、微信支付、银行卡转账，企业用户可申请对公打款。' },
    { q: '数据存储在哪里？', a: '数据存储于国内顶级云服务商，符合等保三级要求，支持私有化部署。' },
    { q: '如何联系客服？', a: '工作日 9:00-18:00 可通过在线客服咨询，或发送邮件至 support@example.com。' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600" />
              <span className="text-xl font-bold">TeamFlow</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a key={item} href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  {item}
                </a>
              ))}
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                登录
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                免费试用
              </button>
            </div>
            
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4">
            {navItems.map((item) => (
              <a key={item} href="#" className="block py-2 text-gray-600">
                {item}
              </a>
            ))}
            <button className="mt-4 w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full">
              免费试用
            </button>
          </div>
        )}
      </nav>

      {/* Hero 区域 */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-sm mb-6">
            🎉 已服务 10,000+ 团队
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              让团队协作
            </span>
            <br />
            更简单高效
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            TeamFlow 是新一代团队协作平台，帮助中小团队提升沟通效率、加速项目推进、实现目标达成。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/register" 
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
            >
              免费试用 14 天
            </a>
            <button className="px-8 py-4 border-2 border-gray-200 rounded-full text-lg hover:border-gray-300 transition-colors">
              观看演示
            </button>
          </div>
        </div>
      </section>

      {/* 功能卡片区 */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            一站式解决团队协作难题
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            从任务管理到知识沉淀，从即时沟通到数据分析，TeamFlow 助力团队高效运转
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-3xl hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 客户案例区 */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            值得信赖的选择
          </h2>
          <p className="text-gray-600 text-center mb-12">
            超过 10,000 家企业正在使用 TeamFlow
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {cases.map((item, index) => (
              <div 
                key={index}
                className="h-24 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 font-semibold hover:bg-gray-100 transition-colors"
              >
                {item.logo}
              </div>
            ))}
          </div>
          
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
                10,000+
              </div>
              <div className="text-gray-600">企业客户</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
                99.9%
              </div>
              <div className="text-gray-600">服务可用性</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
                50+
              </div>
              <div className="text-gray-600">第三方集成</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            常见问题
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  {faq.q}
                  <svg 
                    className={`w-5 h-5 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? 'max-h-40' : 'max-h-0'
                  }`}
                >
                  <p className="px-6 pb-4 text-gray-600">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600" />
                <span className="text-xl font-bold text-white">TeamFlow</span>
              </div>
              <p className="text-sm">
                让团队协作更简单高效
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">产品</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">功能介绍</a></li>
                <li><a href="#" className="hover:text-white transition-colors">价格方案</a></li>
                <li><a href="#" className="hover:text-white transition-colors">更新日志</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">资源</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">帮助中心</a></li>
                <li><a href="#" className="hover:text-white transition-colors">开发者文档</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API 参考</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">公司</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">关于我们</a></li>
                <li><a href="#" className="hover:text-white transition-colors">加入我们</a></li>
                <li><a href="#" className="hover:text-white transition-colors">联系我们</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2024 TeamFlow. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">隐私政策</a>
              <a href="#" className="hover:text-white transition-colors">服务条款</a>
              <a href="#" className="hover:text-white transition-colors">Cookie 设置</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
```

---

**实现要点：**

1. **视觉方向**：蓝紫渐变 (`from-blue-500 to-purple-600`)、卡片圆角 24px (`rounded-3xl`)

2. **交互实现**：
   - 主按钮跳转注册页 (`href="/register"`)
   - 卡片 hover 阴影变化 (`hover:shadow-xl hover:shadow-blue-500/10`)
   - FAQ 展开动画 (`transition-all duration-300`)
   - 移动端导航折叠（响应式菜单）

3. **页面结构**：顶部导航 → Hero → 功能卡片 → 客户案例 → FAQ → Footer

4. **响应式**：移动端菜单、Grid 自适应
