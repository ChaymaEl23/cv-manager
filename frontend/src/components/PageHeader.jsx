export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="section-title mb-3">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-copy mt-3">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  )
}
