'use client';

import Image from 'next/image';
import Link from 'next/link';
import { EnvelopeIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { updateCustomer, State } from '@/app/lib/actions';
import { useActionState } from 'react';
import { Customer } from '@/app/lib/definitions';

export default function Form({
  customer
} : {
  customer: Customer;
}) {
  const initialState: State = { message: "", errors: {} };
  const updateCustomerWithId = updateCustomer.bind(null, customer.id);
  const [state, formAction] = useActionState(updateCustomerWithId, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value="{customer.id}" />
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Enter full name
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Jane Doe"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                defaultValue={customer.name}
                aria-describedby="name-error"
                required
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.name &&
            state.errors.name.map((error: string) => (
              <p className="mt-2 mb-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Enter email
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                defaultValue={customer.email}
                aria-describedby="email-error"
                required
              />
              <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
        <div id="email-error" aria-live="polite" aria-atomic="true">
          {state.errors?.email &&
            state.errors.email.map((error: string) => (
              <p className="mt-2 mb-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>

        <div className="mb-4">
          <label htmlFor="profilePhoto" className="mb-2 block text-sm font-medium">
            Upload profile photo
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="profilePhoto"
                name="profilePhoto"
                type="file"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-11 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="profilePhoto-error"
                required
              />
                <Image className="rounded-full absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2"
                  src={customer.image_url}
                  alt={`${customer.name}'s profile picture`}
                  width={28}
                  height={28}
                />
            </div>
          </div>
        </div>
        <div id="profilePhoto-error" aria-live="polite" aria-atomic="true">
          {state.errors?.profilePhoto &&
            state.errors.profilePhoto.map((error: string) => (
              <p className="mt-2 mb-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>

        {state.message && (
          <div className="mt-2 text-sm text-red-500">
            <p>{state.message}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/customers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit Customer</Button>
      </div>
    </form>
  );
}