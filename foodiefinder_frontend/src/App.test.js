import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders FoodieFinder brand", () => {
  render(<App />);
  const brand = screen.getByText(/FoodieFinder/i);
  expect(brand).toBeInTheDocument();
});
