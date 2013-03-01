class PaintController < ApplicationController
  def index
    @painting_names = Paint.select(:fname)
    @painting_data = Paint.all
  end
  def add
    paint_record = Paint.find_or_initialize_by_fname(params[:fname])
    paint_record.update_attributes(:fname => params[:fname], :img_data => params[:whole_data] )
    redirect_to :action => 'index'
  end
end
