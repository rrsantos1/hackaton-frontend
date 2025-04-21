"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";

interface CardItemProps {
  title: string;
  description: string;
  category?: string;
  type?: string;
  coverImage?: string;
  actions?: React.ReactNode;
  onClick?: () => void;
  highlightOnHover?: boolean;
  mode?: "content" | "activity";
  activityId?: string | number;
}

export default function CardItem({
  title,
  description,
  category,
  type,
  coverImage,
  actions,
  onClick,
  highlightOnHover = true,
  mode = "content",
  activityId,
}: CardItemProps) {
  const router = useRouter();

  const handleActivityClick = () => {
    if (activityId) {
      router.push(`/activities/${activityId}`);
    }
  };

  const isActivity = mode === "activity";

  return (
    <div
      className={`border bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between ${
        highlightOnHover
          ? "hover:shadow-2xl transition-transform transform hover:scale-105"
          : ""
      } ${isActivity ? "cursor-pointer" : ""}`}
      onClick={isActivity ? handleActivityClick : undefined}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600 mt-2">{description}</p>
          {category && (
            <p className="text-sm text-gray-500 mt-2">Categoria: {category}</p>
          )}
          {type && <p className="text-sm text-gray-500 mt-1">Tipo: {type}</p>}
        </div>
        {coverImage && (
          <Image
            src={coverImage}
            alt={title}
            width={168}
            height={168}
            className="object-cover rounded"
          />
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        {mode === "content" && (
          <Button variant="outlined" color="secondary" onClick={onClick}>
            Download
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
}