const { pool } = require('../config/db');

async function seedDatabase() {
    try {
        console.log('Seeding database...');

        // Insert categories
        await pool.query(`
      INSERT INTO categories (name, description) VALUES
      ('Fruits & Vegetables', 'Fresh produce and vegetables'),
      ('Grains & Cereals', 'Rice, flour, and other grains'),
      ('Meat & Fish', 'Fresh and frozen meat and fish'),
      ('Household Items', 'Daily household necessities'),
      ('Electronics', 'Electronic devices and accessories')
      ON CONFLICT DO NOTHING
    `);
        console.log('Categories inserted');

        // Insert markets
        await pool.query(`
      INSERT INTO markets (name, location, latitude, longitude, description) VALUES
      ('Kimironko Market', 'Gasabo District, Kigali', -1.9441, 30.1024, 'One of the largest markets in Kigali'),
      ('Nyabugogo Market', 'Nyarugenge District, Kigali', -1.9614, 30.0447, 'Major trading center in Kigali'),
      ('Remera Market', 'Gasabo District, Kigali', -1.9530, 30.0865, 'Popular market in Remera'),
      ('Musanze Market', 'Musanze District', -1.4998, 29.6344, 'Main market in Northern Province'),
      ('Huye Market', 'Huye District', -2.5972, 29.7389, 'Central market in Southern Province')
      ON CONFLICT DO NOTHING
    `);
        console.log('Markets inserted');

        // Get category and market IDs
        const categoriesResult = await pool.query('SELECT id, name FROM categories');
        const marketsResult = await pool.query('SELECT id, name FROM markets');

        const categories = categoriesResult.rows.reduce((acc, cat) => {
            acc[cat.name] = cat.id;
            return acc;
        }, {});

        const markets = marketsResult.rows.reduce((acc, market) => {
            acc[market.name] = market.id;
            return acc;
        }, {});

        // Insert products
        await pool.query(`
      INSERT INTO products (name, category_id, description) VALUES
      ('Tomatoes (1kg)', ${categories['Fruits & Vegetables']}, 'Fresh red tomatoes'),
      ('Potatoes (1kg)', ${categories['Fruits & Vegetables']}, 'White potatoes'),
      ('Onions (1kg)', ${categories['Fruits & Vegetables']}, 'Red onions'),
      ('Rice (1kg)', ${categories['Grains & Cereals']}, 'White rice'),
      ('Beans (1kg)', ${categories['Grains & Cereals']}, 'Dry beans'),
      ('Chicken (1kg)', ${categories['Meat & Fish']}, 'Fresh chicken'),
      ('Fish (1kg)', ${categories['Meat & Fish']}, 'Fresh tilapia'),
      ('Cooking Oil (1L)', ${categories['Household Items']}, 'Vegetable cooking oil'),
      ('Sugar (1kg)', ${categories['Household Items']}, 'White sugar'),
      ('Salt (1kg)', ${categories['Household Items']}, 'Table salt')
      ON CONFLICT DO NOTHING
    `);
        console.log('Products inserted');

        // Get products
        const productsResult = await pool.query('SELECT id, name FROM products');
        const products = productsResult.rows;

        // Insert sample prices
        const priceInserts = [];
        products.forEach((product) => {
            Object.values(markets).forEach((marketId) => {
                const basePrice = 500 + Math.random() * 1500;
                const price = Math.round(basePrice / 10) * 10; // Round to nearest 10
                priceInserts.push(`(${product.id}, ${marketId}, 1, ${price}, 'RWF', true)`);
            });
        });

        if (priceInserts.length > 0) {
            await pool.query(`
        INSERT INTO prices (product_id, market_id, user_id, price, currency, verified)
        VALUES ${priceInserts.join(', ')}
        ON CONFLICT DO NOTHING
      `);
            console.log('Prices inserted');
        }

        console.log('Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
