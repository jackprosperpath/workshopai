
/**
 * Find existing user by email
 */
export async function findExistingUser(supabase: any, email: string): Promise<string | null> {
  console.log("Checking if organizer has an existing account...");
  
  // Query to find a user with the provided email
  const { data: users, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error("Error fetching users:", error);
    return null;
  }
  
  // Find the user with matching email
  const matchingUser = users?.users?.find(user => user.email === email);
  
  if (matchingUser) {
    console.log(`Found existing user with ID: ${matchingUser.id}`);
    return matchingUser.id;
  } else {
    console.log("No existing user found with that email");
    return null;
  }
}
