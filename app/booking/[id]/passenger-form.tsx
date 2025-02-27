"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Schema for a single passenger
const passengerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  passportNumber: z.string().optional(),
  nationality: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  specialRequests: z.string().optional(),
});

export default function PassengerForm() {
  // This would come from your flight booking context/state
  const [passengers, setPassengers] = useState({
    adults: 2,
    children: 1,
    infants: 1,
  });

  const form = useForm({
    resolver: zodResolver(
      z.object({
        passengers: z.array(passengerSchema),
      })
    ),
  });

  const renderPassengerForms = () => {
    const forms = [];
    let passengerIndex = 0;

    // Add adult passenger forms
    for (let i = 0; i < passengers.adults; i++) {
      forms.push(
        <PassengerFormSection
          key={`adult-${i}`}
          index={passengerIndex}
          type="ADULT"
          number={i + 1}
          form={form}
        />
      );
      passengerIndex++;
    }

    // Add child passenger forms
    for (let i = 0; i < passengers.children; i++) {
      forms.push(
        <PassengerFormSection
          key={`child-${i}`}
          index={passengerIndex}
          type="CHILD"
          number={i + 1}
          form={form}
        />
      );
      passengerIndex++;
    }

    // Add infant passenger forms
    for (let i = 0; i < passengers.infants; i++) {
      forms.push(
        <PassengerFormSection
          key={`infant-${i}`}
          index={passengerIndex}
          type="INFANT"
          number={i + 1}
          form={form}
        />
      );
      passengerIndex++;
    }

    return forms;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Passenger Information
        </h2>
        <p className="text-muted-foreground">
          Please enter the details for all passengers
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            {renderPassengerForms()}
          </Accordion>
        </form>
      </Form>
    </div>
  );
}

function PassengerFormSection({
  index,
  type,
  number,
  form,
}: {
  index: number;
  type: "ADULT" | "CHILD" | "INFANT";
  number: number;
  form: any;
}) {
  // Update the type labels with age ranges
  const getPassengerLabel = (type: string, number: number) => {
    switch (type) {
      case "ADULT":
        return `Adult ${number}`;
      case "CHILD":
        return `Child (2-12 years) ${number}`;
      case "INFANT":
        return `Infant (0-2 years) ${number}`;
      default:
        return "";
    }
  };

  return (
    <AccordionItem value={`passenger-${index}`}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex flex-col items-start">
          <span className="font-semibold">
            {getPassengerLabel(type, number)}
          </span>
          <span className="text-sm text-muted-foreground">
            Enter passenger details
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`passengers.${index}.firstName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`passengers.${index}.lastName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`passengers.${index}.dateOfBirth`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                      placeholder="Select date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`passengers.${index}.gender`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {type === "ADULT" && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`passengers.${index}.passportNumber`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passport Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter passport number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`passengers.${index}.nationality`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter nationality" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`passengers.${index}.email`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`passengers.${index}.phone`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`passengers.${index}.specialRequests`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Requests</FormLabel>
                <FormControl>
                  <Input placeholder="Enter any special requests" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
