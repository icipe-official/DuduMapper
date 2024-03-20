export async function fetchProxy(url: string) {
  try {
    const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
    if (response.ok) {
      return await response.text();
    } else {
      throw new Error('Network response was not ok');
    }
  } catch (error) {
    throw new Error('Error fetching data');
  }
}
