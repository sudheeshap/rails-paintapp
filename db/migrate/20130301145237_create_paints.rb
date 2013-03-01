class CreatePaints < ActiveRecord::Migration
  def change
    create_table :paints do |t|
      t.string :fname
      t.text :img_data

      t.timestamps
    end
  end
end
