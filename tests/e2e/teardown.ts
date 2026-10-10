import { deleteTestLeads } from "./db";

export default async function teardown() {
  try {
    const deleted = await deleteTestLeads();
    console.log(`e2e teardown: removed ${deleted} test leads`);
  } catch (error) {
    console.error("e2e teardown failed", error);
  }
}
