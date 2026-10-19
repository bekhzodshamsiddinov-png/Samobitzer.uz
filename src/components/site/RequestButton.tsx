'use client'

/** Fills the quote form with this product and scrolls to it. */
export function RequestButton({ product, label }: { product: string; label: string }) {
  return (
    <button type="button" className="mt-auto pt-5 text-left text-[15px] font-semibold text-samo hover:text-samo-dark"
      onClick={() => {
        window.dispatchEvent(new CustomEvent('samo:product', { detail: product }))
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
      }}>
      {label} →
    </button>
  )
}
