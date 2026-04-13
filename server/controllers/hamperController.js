import { getDB, saveDB } from '../database/init.js'

export const getAllHampers = (req, res) => {
  try {
    const db = getDB()
    const result = db.exec(`SELECT * FROM hampers ORDER BY name`)

    if (result.length === 0) {
      return res.json([])
    }

    const hampers = result[0].values.map(row => ({
      id: row[0],
      name: row[1],
      description: row[2],
      image: row[3],
      price: row[4],
      items: row[5] ? JSON.parse(row[5]) : [],
      created_at: row[6]
    }))

    res.json(hampers)
  } catch (error) {
    console.error('Get hampers error:', error)
    res.status(500).json({ error: 'Failed to get hampers' })
  }
}

export const getHamperById = (req, res) => {
  try {
    const db = getDB()
    const result = db.exec(`SELECT * FROM hampers WHERE id = ?`, [req.params.id])

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Hamper not found' })
    }

    const hamper = {
      id: result[0].values[0][0],
      name: result[0].values[0][1],
      description: result[0].values[0][2],
      image: result[0].values[0][3],
      price: result[0].values[0][4],
      items: result[0].values[0][5] ? JSON.parse(result[0].values[0][5]) : [],
      created_at: result[0].values[0][6]
    }

    res.json(hamper)
  } catch (error) {
    console.error('Get hamper error:', error)
    res.status(500).json({ error: 'Failed to get hamper' })
  }
}

export const createHamper = (req, res) => {
  try {
    const { name, description, image, price, items } = req.body
    const db = getDB()

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' })
    }

    db.run(
      `INSERT INTO hampers (name, description, image, price, items_json) VALUES (?, ?, ?, ?, ?)`,
      [name, description, image, price, JSON.stringify(items || [])]
    )
    saveDB()

    const result = db.exec(`SELECT * FROM hampers ORDER BY id DESC LIMIT 1`)
    const hamper = {
      id: result[0].values[0][0],
      name: result[0].values[0][1],
      description: result[0].values[0][2],
      image: result[0].values[0][3],
      price: result[0].values[0][4],
      items: result[0].values[0][5] ? JSON.parse(result[0].values[0][5]) : [],
      created_at: result[0].values[0][6]
    }

    res.status(201).json({ message: 'Hamper created', hamper })
  } catch (error) {
    console.error('Create hamper error:', error)
    res.status(500).json({ error: 'Failed to create hamper' })
  }
}

export const updateHamper = (req, res) => {
  try {
    const { name, description, image, price, items } = req.body
    const db = getDB()

    db.run(
      `UPDATE hampers SET name = ?, description = ?, image = ?, price = ?, items_json = ? WHERE id = ?`,
      [name, description, image, price, JSON.stringify(items || []), req.params.id]
    )
    saveDB()

    const result = db.exec(`SELECT * FROM hampers WHERE id = ?`, [req.params.id])

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Hamper not found' })
    }

    const hamper = {
      id: result[0].values[0][0],
      name: result[0].values[0][1],
      description: result[0].values[0][2],
      image: result[0].values[0][3],
      price: result[0].values[0][4],
      items: result[0].values[0][5] ? JSON.parse(result[0].values[0][5]) : [],
      created_at: result[0].values[0][6]
    }

    res.json({ message: 'Hamper updated', hamper })
  } catch (error) {
    console.error('Update hamper error:', error)
    res.status(500).json({ error: 'Failed to update hamper' })
  }
}

export const deleteHamper = (req, res) => {
  try {
    const db = getDB()
    db.run(`DELETE FROM hampers WHERE id = ?`, [req.params.id])
    saveDB()
    res.json({ message: 'Hamper deleted' })
  } catch (error) {
    console.error('Delete hamper error:', error)
    res.status(500).json({ error: 'Failed to delete hamper' })
  }
}
