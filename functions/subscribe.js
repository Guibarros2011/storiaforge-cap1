export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { NOME, EMAIL, SMS, SMS__COUNTRY_CODE } = data;

    if (!EMAIL || !NOME) {
      return Response.json({ error: 'Nome e e-mail são obrigatórios' }, { status: 400 });
    }

    const payload = {
      email: EMAIL,
      attributes: { NOME, PRENOM: NOME },
      listIds: [2],
      updateEnabled: true
    };

    if (SMS) {
      const code = (SMS__COUNTRY_CODE || '+55').replace('+', '');
      const digits = SMS.replace(/\D/g, '');
      payload.attributes.SMS = code + digits;
    }

    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': env.BREVO_KEY
      },
      body: JSON.stringify(payload)
    });

    if (res.status === 201 || res.status === 204) {
      return Response.json({ ok: true });
    }

    const body = await res.json().catch(() => ({}));
    // Contato já existe — ainda é sucesso
    if (body.code === 'duplicate_parameter') {
      return Response.json({ ok: true });
    }

    return Response.json({ error: body.message || 'Erro no Brevo' }, { status: 502 });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
