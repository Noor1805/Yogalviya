import crypto from 'crypto';

const PIXEL_1_ID = '26140052635646014';
const PIXEL_2_ID = '1582394072865167';

export interface MetaEventData {
  email?: string;
  phone?: string;
  eventName: string;
  eventId: string;
  sourceUrl: string;
}

function hashData(data: string | undefined): string | undefined {
  if (!data) return undefined;
  // Meta requires lowercase, whitespace-trimmed strings for hashing
  const normalized = data.trim().toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export async function sendMetaEvent(data: MetaEventData) {
  try {
    const pixelTargets = [
      { pixelId: PIXEL_1_ID, accessToken: process.env.META_CAPI_TOKEN_1?.trim() },
      { pixelId: PIXEL_2_ID, accessToken: process.env.META_CAPI_TOKEN_2?.trim() },
    ].filter(
      (target): target is { pixelId: string; accessToken: string } =>
        Boolean(target.accessToken)
    );

    if (pixelTargets.length === 0) {
      return;
    }

    const hashedEmail = hashData(data.email);
    let normalizedPhone = data.phone?.trim();
    
    // Phone must contain country code without '+'.
    if (normalizedPhone && !normalizedPhone.includes('+')) {
      normalizedPhone = normalizedPhone.replace(/\D/g, '');
      // Assume India +91 if exactly 10 digits
      if (normalizedPhone.length === 10) {
        normalizedPhone = '91' + normalizedPhone;
      }
    } else if (normalizedPhone) {
        normalizedPhone = normalizedPhone.replace(/\D/g, '');
    }
    
    const hashedPhone = hashData(normalizedPhone);

    const eventPayload = {
      data: [
        {
          event_name: data.eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_id: data.eventId,
          event_source_url: data.sourceUrl,
          user_data: {
            // Em: Email, Ph: Phone
            ...(hashedEmail ? { em: [hashedEmail] } : {}),
            ...(hashedPhone ? { ph: [hashedPhone] } : {}),
          },
        },
      ],
    };

    // Send to configured pixels in parallel securely from the server
    const promises = pixelTargets.map((target) =>
      fetch(`https://graph.facebook.com/v18.0/${target.pixelId}/events?access_token=${target.accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload),
      })
    );

    const results = await Promise.allSettled(promises);
    
    // Log any errors if requests fail
    results.forEach((res, index) => {
        if (res.status === 'rejected') {
            console.error(`Meta CAPI Pixel ${index + 1} Error:`, res.reason);
        } else if (!res.value.ok) {
            res.value.json().then(err => console.error(`Meta CAPI Pixel ${index + 1} Error Response:`, err)).catch(() => {});
        }
    });

  } catch (error) {
    console.error('Meta CAPI Helper Error:', error);
  }
}
