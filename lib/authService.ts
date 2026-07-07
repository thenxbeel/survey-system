export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    employeeId: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}