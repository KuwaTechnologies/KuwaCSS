export function Card({ title }: { title: string }) {
  const extra = 'bold';
  return (
    <article className="card stack gap-s">
      <h3 className={'text-xl'}>{title}</h3>
      <p className={`color-muted ${extra}`}>Body</p>
      <button className={"primary"}>Go</button>
    </article>
  );
}
