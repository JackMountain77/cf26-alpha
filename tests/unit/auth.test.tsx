vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(""), // 빈 querystring 반환
}));


import { render, screen } from "@testing-library/react";
import SignInCard from "@/features/auth/components/sign-in-card";
test("renders sign in button", () => {
  render(<SignInCard />);
  expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
});
