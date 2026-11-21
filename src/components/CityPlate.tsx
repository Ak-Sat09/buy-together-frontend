import clsx from 'clsx'

/** City shown the way Indians read places on the road: on a white number plate. */
export function CityPlate({ city, className }: { city: string; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex h-6 items-center rounded-[3px] bg-surface px-2 font-display text-[15px] font-semibold uppercase leading-none tracking-wide text-ink',
        'ring-[1.5px] ring-inset ring-ink',
        className,
      )}
    >
      {city}
    </span>
  )
}
