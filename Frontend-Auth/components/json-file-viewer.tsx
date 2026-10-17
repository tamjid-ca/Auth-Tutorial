"use client";

import React, { useState } from "react";
import { Copy, Check, FileCode, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/animate-ui/components/animate/tooltip";
import { cn } from "@/lib/utils";

interface JsonFileViewerProps {
  filename?: string;
  data: unknown;
  statusCode?: number | null;
  statusText?: string;
  executionTimeMs?: number | null;
  className?: string;
  maxHeight?: string;
  readOnly?: boolean;
}

export function JsonFileViewer({
  filename = "response.json",
  data,
  statusCode,
  statusText,
  executionTimeMs,
  className,
  maxHeight = "400px",
}: JsonFileViewerProps) {
  const [copied, setCopied] = useState(false);

  const jsonString = React.useMemo(() => {
    if (data === undefined || data === null) {
      return "// No data returned yet. Click 'Execute Request' above to test this endpoint.";
    }
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return data;
      }
    }
    return JSON.stringify(data, null, 2);
  }, [data]);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Syntax highlighting for JSON
  const renderHighlightedJson = (text: string) => {
    if (!text || text.startsWith("//")) {
      return <span className="text-muted-foreground italic">{text}</span>;
    }

    const lines = text.split("\n");

    return lines.map((line, idx) => {
      // Color tokens: keys, string values, numbers, booleans, null
      const highlightedLine = line.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
        (match) => {
          let cls = "text-amber-600 dark:text-amber-400"; // number
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = "text-indigo-600 dark:text-indigo-400 font-semibold"; // key
            } else {
              cls = "text-emerald-600 dark:text-emerald-400"; // string
            }
          } else if (/true|false/.test(match)) {
            cls = "text-purple-600 dark:text-purple-400 font-semibold"; // boolean
          } else if (/null/.test(match)) {
            cls = "text-rose-500 font-semibold"; // null
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );

      return (
        <div key={idx} className="table-row leading-relaxed hover:bg-muted/40 transition-colors">
          <span className="table-cell select-none pr-4 text-right font-mono text-[11px] text-muted-foreground/60 w-8 border-r border-border/40">
            {idx + 1}
          </span>
          <span
            className="table-cell pl-4 font-mono text-xs whitespace-pre"
            dangerouslySetInnerHTML={{ __html: highlightedLine }}
          />
        </div>
      );
    });
  };

  const getStatusBadge = () => {
    if (!statusCode) return null;
    if (statusCode >= 200 && statusCode < 300) {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
          {statusCode} {statusText || "OK"}
        </Badge>
      );
    }
    if (statusCode >= 400 && statusCode < 500) {
      return (
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-mono">
          {statusCode} {statusText || "Client Error"}
        </Badge>
      );
    }
    return (
      <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[10px] font-mono">
        {statusCode} {statusText || "Server Error"}
      </Badge>
    );
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs",
        className
      )}
    >
      {/* File Header Tab */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3.5 py-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border/70 shadow-2xs">
            <FileCode className="h-3.5 w-3.5 text-indigo-500" />
            <span className="font-mono text-xs font-semibold text-foreground">
              {filename}
            </span>
          </div>

          {getStatusBadge()}

          {executionTimeMs != null && (
            <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              {executionTimeMs}ms
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span className="ml-1 text-[11px]">{copied ? "Copied" : "Copy"}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy formatted JSON to clipboard</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download as {filename}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Code Display Area with Line Numbers */}
      <div
        className="p-3.5 overflow-auto bg-card/50 font-mono text-xs"
        style={{ maxHeight }}
      >
        <div className="table w-full">{renderHighlightedJson(jsonString)}</div>
      </div>
    </div>
  );
}
