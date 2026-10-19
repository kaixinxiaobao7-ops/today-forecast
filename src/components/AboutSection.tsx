import type { ReactNode } from 'react';
import { useReveal } from '../hooks/useReveal';
import { SectionHead } from './SectionHead';

function AboutCard({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  const ref = useReveal<HTMLElement>();
  return (
    <article ref={ref} data-reveal="" className="about-card panel">
      <span className="about-num">{number}</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

export function AboutSection() {
  return (
    <section className="section container" id="about" aria-labelledby="aboutTitle">
      <SectionHead
        eyebrow="03 / ABOUT"
        title="关于星签"
        titleId="aboutTitle"
        center
        description={
          <>
            星象是一种温柔的提醒，
            <br />
            不是命运的判决。
          </>
        }
      />
      <div className="about-grid">
        <AboutCard number="01" title="每日一签">
          运势签由日期与星座共同生成，同一星座在同一天会得到同一支签。它不是随机的安慰，而是一面可以反复照见的镜子。
        </AboutCard>
        <AboutCard number="02" title="四维解读">
          爱情、事业、财运、健康四个维度，帮助你把「今天怎么样」拆成更具体的问题。分数是参考，行动才是变量。
        </AboutCard>
        <AboutCard number="03" title="留在本地">
          你的星座选择只保存在浏览器本地，我们不会收集、上传或分享任何个人信息。愿你在这里获得一点安静的力量。
        </AboutCard>
      </div>
      <p className="disclaimer">
        * 本站内容为原创文化娱乐内容，星象主题并非实时天文测算，不构成任何专业建议。
      </p>
    </section>
  );
}
