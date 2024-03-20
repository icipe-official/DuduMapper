export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const doi = searchParams.get('doi')

  if (!doi) {
    return new Response(JSON.stringify({ error: 'DOI parameter is missing' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  try {
    const response = await fetch(doi)
    return new Response(JSON.stringify({
      reachable: response.ok,
      response: response.status
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      reachable: false,
      error: "error reaching doi"
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

