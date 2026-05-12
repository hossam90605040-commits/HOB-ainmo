import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block" ref={menuRef}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { open, setOpen })
        }
        return child
      })}
    </div>
  )
}

const DropdownMenuTrigger = ({ children, asChild, open, setOpen, ...props }: any) => {
  return (
    <div onClick={() => setOpen(!open)} className="cursor-pointer" {...props}>
      {children}
    </div>
  )
}

const DropdownMenuContent = ({ children, open, setOpen, align = "end", className }: any) => {
  if (!open) return null
  return (
    <div
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-slate-900 p-1 text-slate-200 shadow-md animate-in fade-in-0 zoom-in-95 mt-2",
        align === "end" ? "right-0" : "left-0",
        className
      )}
      onClick={() => setOpen(false)}
    >
      {children}
    </div>
  )
}

const DropdownMenuItem = ({ children, onClick, className }: any) => (
  <div
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-800 focus:bg-slate-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    onClick={onClick}
  >
    {children}
  </div>
)

const DropdownMenuSeparator = ({ className }: any) => (
  <div className={cn("-mx-1 my-1 h-px bg-white/5", className)} />
)

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
