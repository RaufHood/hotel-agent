interface Props {
  value: number | null
  onChange?: (v: number) => void
  readonly?: boolean
}

export default function StarRating({ value, onChange, readonly = false }: Props) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          className={`text-xl transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'} ${
            value !== null && n <= (value ?? 0) ? 'text-amber-400' : 'text-gray-200'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
