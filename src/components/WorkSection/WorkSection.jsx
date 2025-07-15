import './WorkSection.css';

export function WorkSection() {
  return (
    <section id="work" className="section">
      <div className="work-scroll">
        <div className="work-item work-title">
          <h2>WORK</h2>
        </div>
        {/* 3–4 placeholders */}
        <div className="work-item placeholder">Item 1</div>
        <div className="work-item placeholder">Item 2</div>
        <div className="work-item placeholder">Item 3</div>
      </div>
    </section>
  );
}
