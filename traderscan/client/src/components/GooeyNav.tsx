'use client';

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import "./GooeyNav.css";

type GooeyNavProps = {
  items: { label: string; href: string }[];
};

export function GooeyNav({ items }: GooeyNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  // Set active index based on current path
  useEffect(() => {
    const pathIndex = items.findIndex((item) => {
      if (item.href === '/') {
        return pathname === '/';
      }
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    });
    
    if (pathIndex !== -1) {
      setActiveIndex(pathIndex);
    }
  }, [pathname, items]);

  // Simple navigation handler
  const handleClick = (href: string, index: number) => {
    setActiveIndex(index);
    router.push(href);
  };

  return (
    <div className="gooey-nav-container">
      <nav>
        <ul>
          {items.map((item, index) => (
            <li 
              key={index} 
              className={index === activeIndex ? "active" : ""}
              onClick={() => handleClick(item.href, index)}
            >
              <Link 
                href={item.href}
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
} 