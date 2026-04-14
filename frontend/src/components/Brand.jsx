import { CheckIcon, DocumentIcon } from './Icons'

export default function Brand({ compact = false, light = false }) {
  const titleClass = light ? 'text-white' : 'text-slate-800'
  const subtitleClass = light ? 'text-slate-300' : 'text-slate-500'

  return (
    <div className={`flex items-center gap-4 ${compact ? '' : 'justify-center sm:justify-start'}`}>
      <div className="relative h-16 w-16 shrink-0 rounded-[1.6rem] bg-[linear-gradient(180deg,#61a8ff_0%,#2563eb_75%,#1d4ed8_100%)] p-3 shadow-[0_22px_45px_rgba(37,99,235,0.28)]">
        <div className="flex h-full w-full items-center justify-center rounded-[1.15rem] bg-white/85 text-blue-500 shadow-inner shadow-white/60">
          <DocumentIcon className="h-7 w-7" />
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(180deg,#5fa1ff_0%,#2563eb_100%)] text-white shadow-[0_12px_24px_rgba(37,99,235,0.34)]">
          <CheckIcon className="h-4 w-4" />
        </span>
      </div>
      <div>
        <p className={`text-3xl font-extrabold tracking-[-0.04em] ${titleClass}`}>CV Manager</p>
        {!compact && (
          <p className={`mt-1 text-sm font-medium ${subtitleClass}`}>
            Construisez un profil solide et des candidatures modernes.
          </p>
        )}
      </div>
    </div>
  )
}
