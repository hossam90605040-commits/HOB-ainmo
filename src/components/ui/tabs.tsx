import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = ({ children, defaultValue, className, value, onValueChange }: any) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue)

  React.useEffect(() => {
    if (value) setActiveTab(value)
  }, [value])

  const handleTabChange = (val: string) => {
    setActiveTab(val)
    onValueChange?.(val)
  }

  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (!child) return null
        return React.cloneElement(child, { activeTab, handleTabChange })
      })}
    </div>
  )
}

const TabsList = ({ children, className, activeTab, handleTabChange }: any) => (
  <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-slate-900/50 p-1 text-slate-400", className)}>
    {React.Children.map(children, (child) => {
      if (!child) return null
      return React.cloneElement(child, {
        isActive: activeTab === child.props.value,
        onClick: () => handleTabChange(child.props.value)
      })
    })}
  </div>
)

const TabsTrigger = ({ children, className, isActive, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      isActive ? "bg-slate-950 text-white shadow" : "hover:text-white",
      className
    )}
  >
    {children}
  </button>
)

const TabsContent = ({ children, className, value, activeTab }: any) => {
  if (value !== activeTab) return null
  return <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
