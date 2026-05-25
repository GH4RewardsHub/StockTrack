"use client";

import { AppUser } from "@/types/user";

export default function RoleGuard({
  user,
  allowedRoles,
  children,
}: {
  user: AppUser | null;

  allowedRoles: string[];

  children: React.ReactNode;
}) {
  if (!user) {
    return null;
  }

  if (
    !allowedRoles.includes(user.role)
  ) {
    return (
      <div>
        Unauthorized Access
      </div>
    );
  }

  return children;
}