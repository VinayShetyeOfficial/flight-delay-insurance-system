"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BookingSteps, Step } from "@/components/ui/booking-steps";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

const steps: Step[] = [
  { id: 1, name: "Flight Selection", status: "completed" },
  { id: 2, name: "Passenger Details", status: "current" },
  { id: 3, name: "Review & Pay", status: "upcoming" },
];

const passengerSchema = z.object({
  // Personal Details (from User model)
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),

  // Travel Documents
  passportNumber: z.string().min(1, "Passport number is required"),
  nationality: z.string().min(1, "Nationality is required"),

  // Address
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),

  // Emergency Contact
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactRelation: z.string().min(1, "Relation is required"),
  emergencyContactPhone: z
    .string()
    .min(1, "Emergency contact phone is required"),
  emergencyContactEmail: z.string().email().optional(),
});

type PassengerForm = z.infer<typeof passengerSchema>;

export default function PassengerDetailsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PassengerForm>({
    resolver: zodResolver(passengerSchema),
  });

  // Fetch user data and emergency contact
  useEffect(() => {
    async function fetchUserData() {
      if (session?.user?.email) {
        try {
          const response = await fetch("/api/user/profile");
          const data = await response.json();

          // Pre-fill form with user data
          reset({
            name: data.name || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            dateOfBirth: data.dateOfBirth
              ? format(new Date(data.dateOfBirth), "yyyy-MM-dd")
              : "",
            passportNumber: data.passportNumber || "",
            nationality: data.nationality || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            zipCode: data.zipCode || "",
            country: data.country || "",
            emergencyContactName: data.emergencyContact?.name || "",
            emergencyContactRelation: data.emergencyContact?.relation || "",
            emergencyContactPhone: data.emergencyContact?.phone || "",
            emergencyContactEmail: data.emergencyContact?.email || "",
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [session, reset]);

  const onSubmit = async (data: PassengerForm) => {
    localStorage.setItem("passengerDetails", JSON.stringify(data));
    router.push("/booking/review");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-[1024px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Passenger Details
              </h1>
              <p className="text-muted-foreground">
                Please verify your travel and contact information
              </p>
            </div>
          </div>
        </div>

        {/* Booking Steps */}
        <div className="mb-8">
          <BookingSteps steps={steps} currentStep={2} />
        </div>

        {/* Passenger Details Form */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Details Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Personal Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      className={errors.email ? "border-red-500" : ""}
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      {...register("phoneNumber")}
                      className={errors.phoneNumber ? "border-red-500" : ""}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-red-500">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register("dateOfBirth")}
                      className={errors.dateOfBirth ? "border-red-500" : ""}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-red-500">
                        {errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Travel Document Details */}
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input
                    id="passportNumber"
                    {...register("passportNumber")}
                    className={errors.passportNumber ? "border-red-500" : ""}
                  />
                  {errors.passportNumber && (
                    <p className="text-sm text-red-500">
                      {errors.passportNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    {...register("nationality")}
                    className={errors.nationality ? "border-red-500" : ""}
                  />
                  {errors.nationality && (
                    <p className="text-sm text-red-500">
                      {errors.nationality.message}
                    </p>
                  )}
                </div>

                {/* Address Details */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...register("address")}
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register("city")}
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    {...register("state")}
                    className={errors.state ? "border-red-500" : ""}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-500">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    {...register("zipCode")}
                    className={errors.zipCode ? "border-red-500" : ""}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-red-500">
                      {errors.zipCode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    {...register("country")}
                    className={errors.country ? "border-red-500" : ""}
                  />
                  {errors.country && (
                    <p className="text-sm text-red-500">
                      {errors.country.message}
                    </p>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        {...register("emergencyContactName")}
                        className={
                          errors.emergencyContactName ? "border-red-500" : ""
                        }
                      />
                      {errors.emergencyContactName && (
                        <p className="text-sm text-red-500">
                          {errors.emergencyContactName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactRelation">Relation</Label>
                      <Input
                        id="emergencyContactRelation"
                        {...register("emergencyContactRelation")}
                        className={
                          errors.emergencyContactRelation
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors.emergencyContactRelation && (
                        <p className="text-sm text-red-500">
                          {errors.emergencyContactRelation.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">
                        Phone Number
                      </Label>
                      <Input
                        id="emergencyContactPhone"
                        {...register("emergencyContactPhone")}
                        className={
                          errors.emergencyContactPhone ? "border-red-500" : ""
                        }
                      />
                      {errors.emergencyContactPhone && (
                        <p className="text-sm text-red-500">
                          {errors.emergencyContactPhone.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactEmail">
                        Email (Optional)
                      </Label>
                      <Input
                        id="emergencyContactEmail"
                        type="email"
                        {...register("emergencyContactEmail")}
                        className={
                          errors.emergencyContactEmail ? "border-red-500" : ""
                        }
                      />
                      {errors.emergencyContactEmail && (
                        <p className="text-sm text-red-500">
                          {errors.emergencyContactEmail.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push("/booking")}
                >
                  Back
                </Button>
                <Button type="submit">Continue to Review</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
