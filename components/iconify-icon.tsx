"use client"

import { Icon, type IconProps } from "@iconify/react"

interface IconifyIconProps extends Omit<IconProps, "icon"> {
  icon: string
  className?: string
  size?: number | string
  color?: string
}

/**
 * Universal Iconify icon component for the application.
 * Uses the Iconify icon library to render icons from any icon set.
 *
 * @example
 * <IconifyIcon icon="mdi:wallet" className="w-5 h-5" />
 * <IconifyIcon icon="mdi:home" size={24} color="#AE16A7" />
 */
export function IconifyIcon({
  icon,
  className = "",
  size,
  color,
  ...props
}: IconifyIconProps) {
  return (
    <Icon
      icon={icon}
      className={className}
      width={size}
      height={size}
      color={color}
      {...props}
    />
  )
}

export default IconifyIcon
