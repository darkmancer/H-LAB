import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserProfile from "./UserProfile";

describe("UserProfile", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("renders loading state initially", () => {
    global.fetch = jest.fn(() => Promise.resolve());

    render(<UserProfile userId="123" />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test("displays user data after successful fetch", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            name: "John Doe",
            email: "john@example.com",
          }),
      })
    );

    render(<UserProfile userId="123" />);

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText("John Doe")).toBeInTheDocument()
    );
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/users/123"
    );
  });

  test("displays an error message if the fetch fails", async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error("Failed to fetch user data"))
    );

    render(<UserProfile userId="999" />);

    await waitFor(() =>
      expect(
        screen.getByText(/Error: Failed to fetch user data/i)
      ).toBeInTheDocument()
    );
  });

  test("displays an error message if the response is not OK (e.g., 404)", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    );

    render(<UserProfile userId="404" />);

    // Wait for the error message
    await waitFor(() =>
      expect(
        screen.getByText(/Error: Failed to fetch user data/i)
      ).toBeInTheDocument()
    );
  });
});
