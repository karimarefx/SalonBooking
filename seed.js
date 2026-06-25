import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.dnsemwlraycvgsylpken',
  password: 'SalonSecureBooking2026!',
  ssl: {
    rejectUnauthorized: false
  }
};

async function run() {
  const client = new pg.Client(config);
  try {
    await client.connect();
    console.log('Connected to Supabase database successfully!');

    // Read and run schema.sql
    console.log('Reading schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    console.log('Executing schema...');
    await client.query(schemaSql);
    console.log('Schema executed successfully!');

    // Seed Salons
    console.log('Seeding salons...');
    const salons = [
      {
        id: 'maison-de-beaute',
        name: 'Maison de Beauté',
        location: 'Soho, Manhattan',
        rating: 4.9,
        reviews: 84,
        about: 'An exclusive sanctuary offering bespoke color and precision cutting. Experience unparalleled luxury in the heart of Soho with our master stylists.',
        description: 'At Maison de Beauté, we believe beauty is an intimate dialogue between art and personhood. Our philosophy is rooted in the French tradition of \'effortless elegance\'—enhancing your natural features rather than masking them. Every appointment begins with a personalized consultation in our private garden lounge, ensuring that your journey with us is as serene as the results are stunning. We exclusively use organic, high-performance elixirs crafted in the heart of Provence.',
        image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjHFvOUoUFzcS9fm-il0JQPCA529pBB_3DI0qY_gtHtKGy-8P54l0Ij2n9cm_XfVbJtKWqRffeY0Gebziv7yabVA4sYAz60Afcf_jfe2euUjzXZycXbIrrBhZZotrOTfxM4F5psFcW1wp_ROehfPfemcY1A7KiiH5Gr5_kkhR7OMqSN5VwtVLCwnEvIttzOUzdb8z9OM02DuNnl8meiv58KhlablTAOIyu5AGEZAQ6C1tTtnA0x4BeWDe6hWoaJ2whOo0ui8vu0tM',
        tags: ['Balayage Specialist', 'Extensions', 'Olaplex', 'Haircut', 'Color', 'Highlights']
      },
      {
        id: 'aura-studio',
        name: 'Atelier Miraia',
        location: 'Tribeca, Manhattan',
        rating: 4.8,
        reviews: 128,
        about: 'Where artistry meets wellness. Our holistic approach ensures not just beautiful hair, but a rejuvenating experience utilizing organic, sustainably sourced products.',
        description: 'At Atelier Miraia, we combine cutting-edge hair styling with organic scalp treatments to promote overall wellness. Our styling stations are designed to give you a private, relaxing experience where our specialists customize every treatment to your hair type. We use sustainably sourced, organic products to ensure both your beauty and health are prioritized.',
        image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYtWqmrU_PEdXrU4UF6K2acuMradFY2IuOsE0TZTXUiShdbnCg680Y5a-zVGdV8osXSPRK7D-SQ_hGk4bYQdMxi-0Ls50rp4xjko_awWKkC-y3owP9cgk1NPrqBye6xZ7gEoTGPSXJmeDbilzXg5e-JBEMTO9I50eSxhSoT46uGvLvHpTamyuRyNQqTDg19kTrPlBx7E32tSn5tMNkS_VVistCXErX_d3R14sUYzvpr3vSZhq39B60P5NXH_64OzsBzCOMWN5o1VU',
        tags: ['Organic Color', 'Scalp Therapy', 'Cut & Style', 'Haircut', 'Color', 'Treatments']
      }
    ];

    for (const salon of salons) {
      await client.query(
        `INSERT INTO public.salons (id, name, location, rating, reviews, about, description, image_url, tags) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (id) DO UPDATE SET name = $2, location = $3, rating = $4, reviews = $5, about = $6, description = $7, image_url = $8, tags = $9`,
        [salon.id, salon.name, salon.location, salon.rating, salon.reviews, salon.about, salon.description, salon.image_url, salon.tags]
      );
    }
    console.log('Salons seeded successfully!');

    // Seed Services
    console.log('Seeding services...');
    const services = [
      // Maison de Beauté
      {
        salon_id: 'maison-de-beaute',
        name: 'Signature Haircut',
        price: 95.00,
        duration: '60 min',
        category: 'Haircut & Styling',
        description: 'Our master stylists provide a personalized consultation, followed by a luxury wash, precision cut, and signature blowout finish.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9KMCVZhBF5MNZ0aPhlOfI-ig4B-y-KmDP6jIeW0aTYqxNpQl6mF31hSEslIPpruWkNJAIWbczrZE0AUFJog05Y3cN7B9LcORhbyi7KyAP6w6K8yTNPKACVkO0xu3BUVDv-zNpiJhbbQTpi0BEHNnrgoTjCu347oAjRB4eHOoSWvLjyex5ZyxQYOlkBVsjJjzJsMu5IiTM9_TnI5pfq63N_JNp3UenRUMPKxQIWv-S3mJspWtZG9rb'
      },
      {
        salon_id: 'maison-de-beaute',
        name: 'Blowout & Style',
        price: 65.00,
        duration: '45 min',
        category: 'Haircut & Styling',
        description: 'The ultimate refreshing experience. Includes an exfoliating scalp massage, luxury conditioning, and professional styling of your choice.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDrv5Ocv6QlT1A0itqXBLuXIMjd8tKnDSA9Z8R9SNr5Lj4IBCqjfcb18oczjW5iNpPPt8qf7eN3cf8NeppqD-4y1RdgXBlv0DVBlY-5uhWbqRCILRHeD13G2_3lA9Fhu0bXezT4bNwEhpOnC3g0Y-ZPdM15e-9iAV3MBpBIqCJAP2hvw-i4MB9bcWSoMYmB-LcUerBuZrZaHd6Br7EN_2FuBIKSAVK4zbpm9ke1neIbcbps_eW2Ke8'
      },
      {
        salon_id: 'maison-de-beaute',
        name: 'Couture Cut',
        price: 65.00,
        duration: '75 min',
        category: 'Haircut & Styling',
        description: 'Tailored style designed to enhance your natural features and structure.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS3P7LbzFUnytvRRqAEjeBIi79L54mNQk5kXkU-sFwkfgPEmPoX4ZaP5ZWgQxFXBpH0ObsEbCToggjGRtsaXto0hGG-A9aAWn0KWG5pzqslh-t1F9ki-KTeS273vqkGv5v28JCMfk47VQMakFcC8Aw5PWBWNti446rjSSPD7bZcfGtSBKfMMEbvodne_5r5pFkmMLnIhBg_tBuZdqERex_3tlsSb5czfM_OJoIGjALmmqujd4Qh64x'
      },
      {
        salon_id: 'maison-de-beaute',
        name: 'Balayage Artistry',
        price: 245.00,
        duration: '180 min',
        category: 'Color & Highlights',
        description: 'Custom hand-painted highlights for a natural, sun-kissed look. Includes a gloss toner and deep restorative treatment.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGE9PkQrPTu2_vAA0jq33F7fU56t7auJyCWgKx71-SSDQY3eo4dz3IlsGJsAt_9hW3eLGOoUoGngAA7z1QB5ViZuLAbzqwdjX7kadFMzAp8X7dqDTxq6Zs3aGohK0f4BDc1EMxoVTO4bVNFktVArYzWZDOgBL5VLNgEOrv-aUAe7AyKWASxFM_V_p98Jykdg8WoGixjepmewzI6N3d2ccwJ714_2X9WaFjS0sBUTvmfFoHBk2fSW4e'
      },
      {
        salon_id: 'maison-de-beaute',
        name: 'Signature Color',
        price: 140.00,
        duration: '90 min',
        category: 'Color & Highlights',
        description: 'Full custom single-process color to enrich tones and offer seamless blending.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwrzpzHWs-53xt3GqB1t-1rcFyMYeaCJV-IFnqycgupFXyCgq2N_kFNhgNygY6gbK2BGfPLnf4LYSLt3DBDE6spQvMaZRc3WHj-cM-5DTIACNAUt7sJvm-eW97SMrfSD5pMkWM4UNh3ptKZBPf96-w145hl5I5dOBJIG4-m6jBbBu4mauJBRxfdErMEKZnRTQR3fTWxlYKVuDsHte5GYdl-aLeuJk3YBNsgP9N2EHyQzGNEiH-1maP'
      },
      {
        salon_id: 'maison-de-beaute',
        name: 'Scalp Detox',
        price: 185.00,
        duration: '60 min',
        category: 'Treatments',
        description: 'Deep purifying scalp therapy designed to promote hair health and restore shine.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwZjLW1cgQNLj9oUOgULe95mDJT45UmFsRb1vO6EWnPixsDvkP9pnm6wKggt12o_TpFmxF_E984xmJyC3mJY8Exm8LvEROZFM2Zh-GvMDv0r8OkLL4Oeo-SU2gvQl_7GjT9yLagxF6eSn-w2Keuj_uvvqT5-GYpXN9guAYyq_DQIAD0z_eMr4KI0IfetiUsx_OMwTAbEAG0u4GqadrJtPoWv5PUuVp2MrD4cjFgDXe0N6iXziEvFDN'
      },
      {
        salon_id: 'maison-de-beaute',
        name: 'Miraia Gold Facial',
        price: 145.00,
        duration: '60 min',
        category: 'Treatments',
        description: 'Our signature illuminating treatment using 24k gold leaf and lymphatic drainage.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvGqJJhJfl3oryTxJ4NTGDQk_hGgPiWyaGdCmLT6swfrmx92XjM8cdjgQrcplCCMUlwENIzIcwShdQZMaQvEa7H1xrWYcxZD8Dm4Xaq4dnUTmAyv77JgTsoa_iNsSCE8NDTMqtN6N_4X4vtsOeGigRyXrbI4vNUGNuVUzWHhcIquAqIhRgotWXgMXq3lu49QfppNbVm70cxVe3EcUYctXnCPCgdwVZhrosYoCDNc7dIoqDtlz-agMh'
      },
      {
        salon_id: 'maison-de-beaute',
        name: 'Deep Tissue Release',
        price: 180.00,
        duration: '90 min',
        category: 'Treatments',
        description: 'Targeted pressure for chronic muscle tension and stress relief.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZP8x5hbWIZPo53SXW-FV4ON4iRXdVRPpfnY7_pgN-UhrLKEpMAXkph1rJGNiRPmzeNflVLaOw2nAkqC1DUVhP03WXqOoIHngLTbhcY9VgjG-0w2TE82lc7TumpUgcLqII_LyeiRE9lH0yQzHXysvcNNl75x7EHm7eqyLXd2TCzFgECWhl36wNzpazjFSaBs67PhC13vC1hHPcdzzX5nae2xPzFyGYB7Sjfb7JYWBoYD9aU1G3mBs4'
      },

      // Atelier Miraia
      {
        salon_id: 'aura-studio',
        name: 'Cut & Style',
        price: 85.00,
        duration: '75 min',
        category: 'Haircut & Styling',
        description: 'Precision haircut customized to your face shape and hair texture, complete with signature styling.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS3P7LbzFUnytvRRqAEjeBIi79L54mNQk5kXkU-sFwkfgPEmPoX4ZaP5ZWgQxFXBpH0ObsEbCToggjGRtsaXto0hGG-A9aAWn0KWG5pzqslh-t1F9ki-KTeS273vqkGv5v28JCMfk47VQMakFcC8Aw5PWBWNti446rjSSPD7bZcfGtSBKfMMEbvodne_5r5pFkmMLnIhBg_tBuZdqERex_3tlsSb5czfM_OJoIGjALmmqujd4Qh64x'
      },
      {
        salon_id: 'aura-studio',
        name: 'Red Carpet Blowout',
        price: 65.00,
        duration: '45 min',
        category: 'Haircut & Styling',
        description: 'Intense volume and shine styling for your most important events.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoxxQSzt2aGnAUrku1jRR64WOHyBTUrMOVWD0_sFO6vRJm3lfC-K0sPt6OiEely791aRwt-AsSN2eprc-HCHviyk8p6mYQ7QFFhExibvQEixq9JDt6otYFmzkh6bgjiFDt90a4cg-Hkw1_-xdLQ1L6c_hRgQ7UzybyHFu0SewqWoACOvpJd14Ra38oAyREI16CnsA51f95yj73wUH8VQrQwDNfik-Pm7ph5PjcO0sGKpCIIUrDX632'
      },
      {
        salon_id: 'aura-studio',
        name: 'Organic Color',
        price: 130.00,
        duration: '90 min',
        category: 'Color & Highlights',
        description: 'Full premium single-process color using certified organic, non-toxic formulations.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwrzpzHWs-53xt3GqB1t-1rcFyMYeaCJV-IFnqycgupFXyCgq2N_kFNhgNygY6gbK2BGfPLnf4LYSLt3DBDE6spQvMaZRc3WHj-cM-5DTIACNAUt7sJvm-eW97SMrfSD5pMkWM4UNh3ptKZBPf96-w145hl5I5dOBJIG4-m6jBbBu4mauJBRxfdErMEKZnRTQR3fTWxlYKVuDsHte5GYdl-aLeuJk3YBNsgP9N2EHyQzGNEiH-1maP'
      },
      {
        salon_id: 'aura-studio',
        name: 'Balayage & Glow',
        price: 210.00,
        duration: '150 min',
        category: 'Color & Highlights',
        description: 'Hand-painted highlights for a sun-kissed, natural dimension look.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQW6g8Tc34rpLRaE7BEd9i5VylzgJUY_P3O1i3wfiGxNOLOdIuIdgwPc6TDD65GxUQ7jRoGBGLbhUqKbT5EqI4_v29OtMfYD83K2jZQN07rTsTGNInG-xEUItTneZEC9PGR82SlYYCBSt4CzLTcLseHqFMyvkCuCJpB8tCFz6JOQLkvtQSzFYiQGVNiR9s8wlDm5sbk4pdftH-t36tAY7A_zoneJB1_0vFGFShEhfC4PNcMiPRoUWk'
      },
      {
        salon_id: 'aura-studio',
        name: 'Scalp Therapy',
        price: 110.00,
        duration: '60 min',
        category: 'Treatments',
        description: 'Holistic scalp treatments with customized botanical serums for ultimate scalp health.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwZjLW1cgQNLj9oUOgULe95mDJT45UmFsRb1vO6EWnPixsDvkP9pnm6wKggt12o_TpFmxF_E984xmJyC3mJY8Exm8LvEROZFM2Zh-GvMDv0r8OkLL4Oeo-SU2gvQl_7GjT9yLagxF6eSn-w2Keuj_uvvqT5-GYpXN9guAYyq_DQIAD0z_eMr4KI0IfetiUsx_OMwTAbEAG0u4GqadrJtPoWv5PUuVp2MrD4cjFgDXe0N6iXziEvFDN'
      }
    ];

    for (const service of services) {
      await client.query(
        `INSERT INTO public.services (salon_id, name, duration, price, image, category, description) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [service.salon_id, service.name, service.duration, service.price, service.image, service.category, service.description]
      );
    }
    console.log('Services seeded successfully!');

    // Seed Specialists
    console.log('Seeding specialists...');
    const specialists = [
      {
        salon_id: 'maison-de-beaute',
        name: 'Julianne V.',
        title: 'Creative Director',
        rating: 4.9,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA11Dqp17R4H87N_xWha2fwH4Y82r5R7K2HKtCjPBGDFA76caP_JbNGcW_F0zxJOQRn11IBA5RQ5FsHWTOY4WGaAbdqh3A2Fnqyq0576tEVulHfjWvO73nWPyrVPbDJlZ47jAttprfx3IilQp9_5KLz1CrHd5Tu7a-qEr8ZP7VIKe7jAT42Sa-4FRz-EUXakFgO6VoNB3oz0vsWEC6g9uWrID_5qoVIpW2oFLqebflGF3eDSPJSDunH'
      },
      {
        salon_id: 'maison-de-beaute',
        name: 'Marc-Antoine',
        title: 'Master Colorist',
        rating: 4.8,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZtjajcUEbIVJ0FkuQ_Lg04sD9bKq99fV04Wavxchr2qYh2_npQgQAzxkC4kGEdHjSNGINr2bmKcYVHuKM-bbD5iUM4kLeLuNqPP6Bx_B15MlfAQYXLpLirCpkGfLI9j6hRcYIdW-yxgUrjjbn9FnOPsbvCISxZy-3ptAfyCVD3G7pg9vzbqhP-tAMgybkY7gwCRcQVAhlZhFZHRKeA7mr0As9jli4TRAnuMWeifU418P_Bjh4Ler_'
      },
      {
        salon_id: 'maison-de-beaute',
        name: 'Léa Dupont',
        title: 'Treatment Specialist',
        rating: 4.7,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5pla7JCebC51sK1EJ3HkZr5jZ3r7HP_LXZv7Ag_gHQQS31mbyOu6V5czZfeMdNnUn4XdPnXLBACcYQFeF2RnFcgrCeAxOO-9qMB07GNpCWNOASvfgVdpdVQbyn-4S2WI-aFWC6bGE8mHG5ED3Gc9daQe75FVY7soU6Elrt6Yo_FFIAj3fSWEyavdnZg0PygGIghiQE_HyOQviHhtj0J1NN3KRk90juncY_HB_9McPNw-8jAxNlT_6'
      },
      {
        salon_id: 'aura-studio',
        name: 'Elena Vance',
        title: 'Senior Stylist',
        rating: 4.9,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA11Dqp17R4H87N_xWha2fwH4Y82r5R7K2HKtCjPBGDFA76caP_JbNGcW_F0zxJOQRn11IBA5RQ5FsHWTOY4WGaAbdqh3A2Fnqyq0576tEVulHfjWvO73nWPyrVPbDJlZ47jAttprfx3IilQp9_5KLz1CrHd5Tu7a-qEr8ZP7VIKe7jAT42Sa-4FRz-EUXakFgO6VoNB3oz0vsWEC6g9uWrID_5qoVIpW2oFLqebflGF3eDSPJSDunH'
      },
      {
        salon_id: 'aura-studio',
        name: 'Sarah Chen',
        title: 'Master Colorist',
        rating: 5.0,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZtjajcUEbIVJ0FkuQ_Lg04sD9bKq99fV04Wavxchr2qYh2_npQgQAzxkC4kGEdHjSNGINr2bmKcYVHuKM-bbD5iUM4kLeLuNqPP6Bx_B15MlfAQYXLpLirCpkGfLI9j6hRcYIdW-yxgUrjjbn9FnOPsbvCISxZy-3ptAfyCVD3G7pg9vzbqhP-tAMgybkY7gwCRcQVAhlZhFZHRKeA7mr0As9jli4TRAnuMWeifU418P_Bjh4Ler_  '
      },
      {
        salon_id: 'aura-studio',
        name: 'Mia Rossi',
        title: 'Esthetician',
        rating: 4.8,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5pla7JCebC51sK1EJ3HkZr5jZ3r7HP_LXZv7Ag_gHQQS31mbyOu6V5czZfeMdNnUn4XdPnXLBACcYQFeF2RnFcgrCeAxOO-9qMB07GNpCWNOASvfgVdpdVQbyn-4S2WI-aFWC6bGE8mHG5ED3Gc9daQe75FVY7soU6Elrt6Yo_FFIAj3fSWEyavdnZg0PygGIghiQE_HyOQviHhtj0J1NN3KRk90juncY_HB_9McPNw-8jAxNlT_6'
      }
    ];

    for (const specialist of specialists) {
      await client.query(
        `INSERT INTO public.specialists (salon_id, name, title, rating, image) VALUES ($1, $2, $3, $4, $5)`,
        [specialist.salon_id, specialist.name, specialist.title, specialist.rating, specialist.image]
      );
    }
    console.log('Specialists seeded successfully!');

    console.log('Database schema and seed completed successfully!');
  } catch (err) {
    console.error('Error executing seed script:', err);
  } finally {
    await client.end();
  }
}

run();
