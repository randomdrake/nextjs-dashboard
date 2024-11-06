'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { put, del } from '@vercel/blob';
import { fetchCustomerById } from './data';

const InvoiceFormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CustomerFormSchema = z.object({
  id: z.string(),
  name: z.string({
    invalid_type_error: 'Please enter a name.',
  }),
  email: z
    .string({
      invalid_type_error: 'Please enter an email.',
    })
    .email({ message: 'Please enter a valid email address.' }),
  profilePhoto: z
    .instanceof(File)
    .refine((file) => file.size < 4900000, {
      message: 'Please upload a profile file smaller than 4.9MB.',
    })
    .refine((file) => file.size > 0, {
      message: 'Please upload a profile file.',
    }),
});

const CreateInvoice = InvoiceFormSchema.omit({ id: true, date: true });
const UpdateInvoice = InvoiceFormSchema.omit({ id: true, date: true });

const CreateCustomer = CustomerFormSchema.omit({ id: true });
const UpdateCustomer = CustomerFormSchema.omit({ id: true });

export type State = {
  errors?: {
    customerID?: string[];
    amount?: string[];
    status?: string[];
    name?: string[];
    email?: string[];
  };
  message: string;
};

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form data using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue. 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  console.log('Creating invoice:', { customerId, amountInCents, status, date });

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: `Database Error: Failed to Create Invoice. Error: ${error}`,
    }
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string, 
  prevState: State, 
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  console.log('Updating invoice:', { id, customerId, amountInCents, status });

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: `Database Error: Failed to Update Invoice. Error: ${error}`,
    }
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  console.log('Deleting invoice:', id);

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return {
      message: `Database Error: Failed to Delete Invoice. Error: ${error}`,
    }
  }
}

export async function createCustomer(prevState: State, formData: FormData) {
  const validatedFields = CreateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    profilePhoto: formData.get('profilePhoto') as File,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Customer.',
    };
  }

  const { name, email, profilePhoto } = validatedFields.data;

  console.log('Handling file upload:', profilePhoto.name);
  const blob = await put(profilePhoto.name, profilePhoto, {
    access: 'public',
  });

  const imageUrl = blob.url;

  console.log('Creating customer:', { name, email, imageUrl });

  try {
    await sql`
      INSERT INTO customers (name, email, image_url)
      VALUES (${name}, ${email}, ${imageUrl})
    `;
  } catch (error) {
    return {
      message: `Database Error: Failed to Create Customer. Error: ${error}`,
    }
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function updateCustomer(
  id: string, 
  prevState: State, 
  formData: FormData
) {
  const validatedFields = UpdateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Customer.',
    };
  }

  const { name, email } = validatedFields.data;

  console.log('Updating customer:', { id, name, email });

  try {
    await sql`
      UPDATE customers
      SET name = ${name}, email = ${email}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: `Database Error: Failed to Update Customer. Error: ${error}`,
    }
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function deleteCustomer(id: string) {
  console.log('Deleting customer:', id);

  // Get the customer so we can grab the image_url to delete and verify they exist
  const customer = await fetchCustomerById(id);
  if (!customer) {
    return { message: 'Customer not found.' };
  }

  try {
    await sql`DELETE FROM customers WHERE id = ${id}`;
  } catch (error) {
    return {
      message: `Database Error: Failed to Delete Customer. Error: ${error}`,
    }
  }

  // Also delete all invoices associated with the customer
  try {
    await sql`DELETE FROM invoices WHERE customer_id = ${id}`;
  } catch (error) {
    return {
      message: `Database Error: Failed to Delete Customer's Invoices. Error: ${error}`,
    }
  }

  // Also delete the profile image
  try {
    await del(customer.image_url);
    revalidatePath('/dashboard/customers');
    return { message: 'Deleted Customer.' };
  } catch (error) {
    return {
      message: `Failed to Delete Customer's Profile Image. Error: ${error}`,
    }
  }
}